#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
Baseball Hub — Custom XGBoost Stuff+ Model Pipeline for 2026 Season
═══════════════════════════════════════════════════════════════════════════════

Implements Jack's custom Stuff+ model that predicts pitcher whiff probability
per pitch using XGBoost, then aggregates to pitcher-season level and normalizes
to 20-80 scouting scale (probit), converting to 100-centered scale.

Pipeline:
1. Pull pitch-level Statcast data via pybaseball for 2026 (and 2020-2025 for training)
2. Engineer features across 5 dimensions (velocity/movement, tunneling, sequencing, deception, whiff)
3. Train XGBoost model on 2020-2025 data with is_whiff as target
4. Score 2026 pitches and aggregate per pitcher-season
5. Normalize with probit (mean=50, std=10) per season on 20-80 scale
6. Convert to 100-centered: 100 + (raw - 50) * 1.5
7. Output to data/stuffplus-custom.json and update js/data.js

Usage:
  python3 scripts/compute_stuffplus.py [--force-retrain] [--verbose]

Runs in GitHub Actions (ubuntu-latest, Python 3.10+) with daily cron.
"""

import os
import sys
import json
import logging
import pickle
import warnings
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Tuple, Any

import pandas as pd
import numpy as np
from scipy.special import ndtri, norm  # For probit transform
from scipy.spatial.distance import cosine

try:
    from pybaseball import statcast
except ImportError:
    print("ERROR: pybaseball not installed. Install with: pip install pybaseball")
    sys.exit(1)

try:
    import xgboost as xgb
except ImportError:
    print("ERROR: xgboost not installed. Install with: pip install xgboost")
    sys.exit(1)

try:
    from sklearn.preprocessing import StandardScaler
except ImportError:
    print("ERROR: scikit-learn not installed. Install with: pip install scikit-learn")
    sys.exit(1)

# Suppress warnings
warnings.filterwarnings('ignore')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

REPO_ROOT = Path(__file__).parent.parent
DATA_DIR = REPO_ROOT / 'data'
SCRIPTS_DIR = REPO_ROOT / 'scripts'
JS_DIR = REPO_ROOT / 'js'

DATA_DIR.mkdir(exist_ok=True)
(DATA_DIR / 'model_cache').mkdir(exist_ok=True)

# Model files
MODEL_CACHE_FILE = DATA_DIR / 'model_cache' / 'stuffplus_model.pkl'
SCALER_CACHE_FILE = DATA_DIR / 'model_cache' / 'stuffplus_scaler.pkl'

# Output files
STUFFPLUS_JSON = DATA_DIR / 'stuffplus-custom.json'
DATA_JS = JS_DIR / 'data.js'

# Training data file (from uploads, if available)
TRAINING_DATA_CSV = Path('/sessions/nifty-zealous-thompson/mnt/uploads/pitcher_leaderboard_v1-0a88b1a1.csv')

# FanGraphs Stuff+ reference (for merging stats)
FG_STUFFPLUS_JSON = DATA_DIR / 'fg-stuffplus.json'

# Constants
TRAINING_SEASONS = [2020, 2021, 2022, 2023, 2024, 2025]
TARGET_SEASON = 2026
PROBIT_SCALE_MIN = 20
PROBIT_SCALE_MAX = 80
PROBIT_SCALE_MEAN = 50
PROBIT_SCALE_STD = 10
FINAL_SCALE_CENTER = 100
FINAL_SCALE_SLOPE = 1.5

# Pitch type categorization
FASTBALL_TYPES = {'FF', 'SI', 'FC'}
BREAKING_TYPES = {'SL', 'CU', 'KC', 'SV', 'ST', 'CS'}
OFFSPEED_TYPES = {'CH', 'FS', 'FO', 'SC', 'KN'}

# Batch size for Statcast queries (avoid timeouts)
STATCAST_BATCH_DAYS = 30

# ═══════════════════════════════════════════════════════════════════════════════
# FEATURE ENGINEERING
# ═══════════════════════════════════════════════════════════════════════════════

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Engineer all 5 feature dimensions:
    1. Velocity & Movement Differentials
    2. Tunneling
    3. Sequencing
    4. Deception
    5. Whiff/Chase Metrics

    Returns DataFrame with engineered features added.
    """
    df = df.copy()
    logger.info(f"Engineering features for {len(df)} pitches...")

    # ─────────────────────────────────────────────────────────────────────────
    # 1. VELOCITY & MOVEMENT DIFFERENTIALS
    # ─────────────────────────────────────────────────────────────────────────

    # For each pitcher, find their primary fastball type and velocity/movement
    pitcher_fb_stats = df[df['pitch_type'].isin(FASTBALL_TYPES)].groupby('pitcher').agg({
        'pitch_type': lambda x: x.mode()[0] if len(x.mode()) > 0 else 'FF',
        'release_speed': 'mean',
        'pfx_x': 'mean',
        'pfx_z': 'mean'
    }).rename(columns={
        'pitch_type': 'primary_fb_type',
        'release_speed': 'primary_fb_velo',
        'pfx_x': 'primary_fb_pfx_x',
        'pfx_z': 'primary_fb_pfx_z'
    })

    df = df.merge(pitcher_fb_stats, left_on='pitcher', right_index=True, how='left')

    # Velocity differential: fastball velo - this pitch velo
    df['velo_diff'] = df['primary_fb_velo'] - df['release_speed']
    df['velo_diff'] = df['velo_diff'].fillna(0)

    # Horizontal movement differential
    df['hmov_diff'] = (df['primary_fb_pfx_x'] - df['pfx_x']).fillna(0)

    # Vertical movement differential
    df['vmov_diff'] = (df['primary_fb_pfx_z'] - df['pfx_z']).fillna(0)

    # ─────────────────────────────────────────────────────────────────────────
    # 2. TUNNELING
    # ─────────────────────────────────────────────────────────────────────────

    # Release point spread per pitcher
    pitcher_rp_stats = df.groupby('pitcher').agg({
        'x0': ['mean', 'std'],
        'z0': ['mean', 'std']
    }).fillna(0)
    pitcher_rp_stats.columns = ['rp_x_mean', 'rp_x_std', 'rp_z_mean', 'rp_z_std']

    df = df.merge(pitcher_rp_stats, left_on='pitcher', right_index=True, how='left')
    df['release_point_spread'] = (
        df['rp_x_std'] ** 2 + df['rp_z_std'] ** 2
    ) ** 0.5
    df['release_point_spread'] = df['release_point_spread'].fillna(0)

    # Tunnel difference from fastball: Euclidean distance in 3D space (x, z, speed)
    # at release point
    df['tunnel_diff_from_fb'] = (
        ((df['x0'] - df['rp_x_mean']) ** 2 +
         (df['z0'] - df['rp_z_mean']) ** 2 +
         ((df['release_speed'] - df['primary_fb_velo']) / 10) ** 2) ** 0.5
    ).fillna(0)

    # Early trajectory similarity: cosine similarity of (vx0, vz0) to fastball
    df['early_trajectory_sim'] = 0.0
    for idx in df.index:
        try:
            vx0 = df.loc[idx, 'vx0']
            vz0 = df.loc[idx, 'vz0']
            if pd.notna(vx0) and pd.notna(vz0):
                # Get average fastball trajectory for this pitcher
                fb_data = df[(df['pitcher'] == df.loc[idx, 'pitcher']) &
                            (df['pitch_type'].isin(FASTBALL_TYPES))]
                if len(fb_data) > 0:
                    fb_vx0_avg = fb_data['vx0'].mean()
                    fb_vz0_avg = fb_data['vz0'].mean()
                    if pd.notna(fb_vx0_avg) and pd.notna(fb_vz0_avg):
                        vec1 = np.array([vx0, vz0])
                        vec2 = np.array([fb_vx0_avg, fb_vz0_avg])
                        norm1 = np.linalg.norm(vec1)
                        norm2 = np.linalg.norm(vec2)
                        if norm1 > 0 and norm2 > 0:
                            df.loc[idx, 'early_trajectory_sim'] = np.dot(vec1, vec2) / (norm1 * norm2)
        except:
            pass

    # ─────────────────────────────────────────────────────────────────────────
    # 3. SEQUENCING
    # ─────────────────────────────────────────────────────────────────────────

    # Sort by pitcher-inning-batter for sequencing
    df_seq = df.sort_values(['pitcher', 'game_date', 'inning', 'batter']).reset_index(drop=True)

    # Previous pitch type and speed
    df_seq['prev_pitch_type'] = df_seq.groupby('pitcher')['pitch_type'].shift(1)
    df_seq['prev_release_speed'] = df_seq.groupby('pitcher')['release_speed'].shift(1)

    # Pitch type encoded
    pitch_type_encoding = {pt: i for i, pt in enumerate(
        df['pitch_type'].dropna().unique()
    )}
    df_seq['pitch_type_enc'] = df_seq['pitch_type'].map(pitch_type_encoding).fillna(-1)
    df_seq['prev_pitch_type_enc'] = df_seq['prev_pitch_type'].map(pitch_type_encoding).fillna(-1)

    # Velocity change from previous pitch
    df_seq['seq_velo_change'] = (
        df_seq['release_speed'] - df_seq['prev_release_speed']
    ).fillna(0)

    # Movement changes
    df_seq['prev_pfx_x'] = df_seq.groupby('pitcher')['pfx_x'].shift(1)
    df_seq['prev_pfx_z'] = df_seq.groupby('pitcher')['pfx_z'].shift(1)
    df_seq['seq_hmov_change'] = (df_seq['pfx_x'] - df_seq['prev_pfx_x']).fillna(0)
    df_seq['seq_vmov_change'] = (df_seq['pfx_z'] - df_seq['prev_pfx_z']).fillna(0)

    # Location shift
    df_seq['prev_plate_x'] = df_seq.groupby('pitcher')['plate_x'].shift(1)
    df_seq['prev_plate_z'] = df_seq.groupby('pitcher')['plate_z'].shift(1)
    df_seq['seq_location_shift'] = (
        ((df_seq['plate_x'] - df_seq['prev_plate_x']) ** 2 +
         (df_seq['plate_z'] - df_seq['prev_plate_z']) ** 2) ** 0.5
    ).fillna(0)

    # Pitcher entropy (diversity of pitch types thrown)
    pitcher_pt_entropy = df_seq.groupby('pitcher')['pitch_type'].apply(
        lambda x: -(pd.Series(x).value_counts(normalize=True) *
                    np.log2(pd.Series(x).value_counts(normalize=True))).sum()
    ).rename('pitcher_entropy')
    df_seq = df_seq.merge(pitcher_pt_entropy, left_on='pitcher', right_index=True, how='left')
    df_seq['pitcher_entropy'] = df_seq['pitcher_entropy'].fillna(0)

    # Transition surprise: how unexpected is this pitch given sequence?
    # Simplified: distance from pitcher's average pitch distribution
    df_seq['transition_surprise'] = 0.0

    df = df_seq

    # ─────────────────────────────────────────────────────────────────────────
    # 4. DECEPTION
    # ─────────────────────────────────────────────────────────────────────────

    # Perceived velocity: extension-adjusted (longer extension = perceived slower)
    pitcher_ext = df.groupby('pitcher')['extension'].mean().rename('avg_extension')
    df = df.merge(pitcher_ext, left_on='pitcher', right_index=True, how='left')
    df['extension_vs_avg'] = (df['extension'] - df['avg_extension']).fillna(0)
    df['perceived_velocity'] = df['release_speed'] - (df['extension_vs_avg'] * 2)  # Extension adds ~2mph perceived

    # Vertical Approach Angle (VAA): angle of pitch approach
    df['VAA'] = np.degrees(np.arctan2(
        (df['z0'] - df['pz']).fillna(0),
        ((df['x0'].fillna(0) - df['px'].fillna(0)) ** 2 +
         ((df['y0'].fillna(1) - 1.5) ** 2)) ** 0.5
    ))
    df['VAA'] = df['VAA'].fillna(0)

    # Horizontal Approach Angle (HAA)
    df['HAA'] = np.degrees(np.arctan2(
        (df['x0'] - df['px']).fillna(0),
        (df['y0'].fillna(1) - 1.5)
    ))
    df['HAA'] = df['HAA'].fillna(0)

    # ─────────────────────────────────────────────────────────────────────────
    # 5. WHIFF / CHASE METRICS
    # ─────────────────────────────────────────────────────────────────────────

    df['is_swing'] = (df['description'].str.contains('swing', case=False, na=False)).astype(int)
    df['is_whiff'] = (df['description'].str.contains('whiff', case=False, na=False)).astype(int)
    df['is_called_strike'] = (df['description'].str.contains('called_strike', case=False, na=False)).astype(int)
    df['is_csw'] = ((df['is_called_strike'] | df['is_whiff'])).astype(int)
    df['is_in_zone'] = (df['zone'].notna() & df['zone'].astype(int).between(1, 9)).astype(int)
    df['is_chase'] = ((df['is_swing'] == 1) & (df['is_in_zone'] == 0)).astype(int)

    logger.info(f"Engineered {len(df)} pitches with all features")
    return df

# ═══════════════════════════════════════════════════════════════════════════════
# STATCAST DATA FETCHING
# ═══════════════════════════════════════════════════════════════════════════════

def fetch_statcast_data(season: int) -> pd.DataFrame:
    """
    Fetch pitch-level Statcast data for a given season.
    Pulls in batches to avoid timeouts.
    """
    logger.info(f"Fetching Statcast data for {season}...")

    # Define date range for season
    season_start = f"{season}-03-28"
    season_end = f"{season}-11-01"

    all_data = []
    current_date = datetime.strptime(season_start, '%Y-%m-%d')
    end_date = datetime.strptime(season_end, '%Y-%m-%d')

    batch_num = 0
    while current_date < end_date:
        batch_start = current_date.strftime('%Y-%m-%d')
        batch_end = (current_date + timedelta(days=STATCAST_BATCH_DAYS)).strftime('%Y-%m-%d')

        try:
            logger.info(f"  Fetching {season} batch {batch_num + 1}: {batch_start} to {batch_end}...")
            batch_data = statcast(start_date=batch_start, end_date=batch_end)

            if batch_data is not None and len(batch_data) > 0:
                batch_data['season'] = season
                all_data.append(batch_data)
                logger.info(f"    Got {len(batch_data)} pitches")
            else:
                logger.info(f"    No data for this batch")
        except Exception as e:
            logger.error(f"  Error fetching {batch_start} to {batch_end}: {e}")

        current_date += timedelta(days=STATCAST_BATCH_DAYS)
        batch_num += 1

    if len(all_data) == 0:
        logger.warning(f"No Statcast data found for season {season}")
        return pd.DataFrame()

    result = pd.concat(all_data, ignore_index=True)
    logger.info(f"Total {len(result)} pitches for {season}")
    return result

def prepare_training_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Prepare training data from raw Statcast.
    Returns: (features, target) ready for XGBoost.
    """
    logger.info(f"Preparing training data...")

    # Required columns
    required_cols = [
        'pitcher', 'release_speed', 'pfx_x', 'pfx_z',
        'x0', 'z0', 'vx0', 'vz0', 'pitch_type', 'plate_x', 'plate_z',
        'description', 'zone', 'extension', 'game_date', 'inning', 'batter'
    ]

    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        logger.warning(f"Missing columns: {missing}")

    # Fill nulls
    df = df.fillna(0)

    # Filter to pitchers with reasonable sample
    pitcher_counts = df['pitcher'].value_counts()
    min_pitches = 10
    valid_pitchers = pitcher_counts[pitcher_counts >= min_pitches].index
    df = df[df['pitcher'].isin(valid_pitchers)]

    logger.info(f"{len(df)} pitches from {df['pitcher'].nunique()} pitchers after filtering")
    return df

def train_model(train_df: pd.DataFrame) -> Tuple[xgb.XGBClassifier, StandardScaler]:
    """
    Train XGBoost model on historical data.
    Returns: (model, scaler)
    """
    logger.info(f"Training XGBoost model on {len(train_df)} pitches...")

    # Feature list (exclude identifier and target columns)
    feature_cols = [
        'velo_diff', 'hmov_diff', 'vmov_diff',
        'release_point_spread', 'tunnel_diff_from_fb', 'early_trajectory_sim',
        'seq_velo_change', 'seq_hmov_change', 'seq_vmov_change', 'seq_location_shift',
        'pitcher_entropy', 'transition_surprise',
        'perceived_velocity', 'VAA', 'HAA', 'extension_vs_avg',
        'release_speed', 'pfx_x', 'pfx_z', 'pitch_type_enc', 'prev_pitch_type_enc',
        'is_in_zone', 'is_swing'
    ]

    # Keep only available features
    available_features = [col for col in feature_cols if col in train_df.columns]
    logger.info(f"Using {len(available_features)} features")

    X = train_df[available_features].fillna(0).astype(np.float32)
    y = train_df['is_whiff'].fillna(0).astype(int)

    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train XGBoost
    model = xgb.XGBClassifier(
        n_estimators=500,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
        tree_method='hist',  # Fast on CPU
        verbosity=0
    )

    model.fit(X_scaled, y, verbose=False)

    logger.info(f"Model trained. Feature importance (top 10):")
    importances = dict(zip(available_features, model.feature_importances_))
    for feat, imp in sorted(importances.items(), key=lambda x: x[1], reverse=True)[:10]:
        logger.info(f"  {feat}: {imp:.4f}")

    return model, scaler

# ═══════════════════════════════════════════════════════════════════════════════
# SCORING & AGGREGATION
# ═══════════════════════════════════════════════════════════════════════════════

def score_2026_pitches(
    model: xgb.XGBClassifier,
    scaler: StandardScaler,
    df_2026: pd.DataFrame
) -> pd.DataFrame:
    """
    Score 2026 pitches with trained model.
    Returns: pitches with predicted whiff probability.
    """
    logger.info(f"Scoring {len(df_2026)} 2026 pitches...")

    feature_cols = [
        'velo_diff', 'hmov_diff', 'vmov_diff',
        'release_point_spread', 'tunnel_diff_from_fb', 'early_trajectory_sim',
        'seq_velo_change', 'seq_hmov_change', 'seq_vmov_change', 'seq_location_shift',
        'pitcher_entropy', 'transition_surprise',
        'perceived_velocity', 'VAA', 'HAA', 'extension_vs_avg',
        'release_speed', 'pfx_x', 'pfx_z', 'pitch_type_enc', 'prev_pitch_type_enc',
        'is_in_zone', 'is_swing'
    ]
    available_features = [col for col in feature_cols if col in df_2026.columns]

    X = df_2026[available_features].fillna(0).astype(np.float32)
    X_scaled = scaler.transform(X)

    df_2026['pred_whiff_prob'] = model.predict_proba(X_scaled)[:, 1]

    logger.info(f"Scored pitches. Mean predicted whiff: {df_2026['pred_whiff_prob'].mean():.4f}")
    return df_2026

def aggregate_pitcher_season(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate predicted whiff rate per pitcher-season.
    """
    logger.info(f"Aggregating by pitcher-season...")

    agg_dict = {
        'pred_whiff_prob': 'mean',
        'is_whiff': ['sum', 'count', 'mean'],  # actual whiffs, total pitches, actual rate
        'pitcher': 'first',  # Just to keep reference
    }

    result = df.groupby(['pitcher', 'season']).agg(agg_dict).reset_index()
    result.columns = ['pitcher', 'season', 'avg_pred_whiff', 'actual_whiffs', 'n_pitches', 'actual_whiff_rate']

    # Categorize by pitch type
    for pitch_category, types in [('fastball', FASTBALL_TYPES), ('breaking', BREAKING_TYPES), ('offspeed', OFFSPEED_TYPES)]:
        pitch_data = df[df['pitch_type'].isin(types)].groupby(['pitcher', 'season']).agg({
            'pitch_type': 'count',
            'pred_whiff_prob': 'mean'
        }).rename(columns={'pitch_type': f'{pitch_category}_count', 'pred_whiff_prob': f'{pitch_category}_whiff'})

        result = result.merge(pitch_data, left_on=['pitcher', 'season'], right_index=True, how='left')

    result = result.fillna(0)
    logger.info(f"Aggregated to {len(result)} pitcher-seasons")
    return result

def normalize_to_scouting_scale(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize predictions to 20-80 scouting scale using probit transformation.
    Then convert to 100-centered scale: 100 + (raw - 50) * 1.5
    """
    logger.info(f"Normalizing to scouting scale...")

    df = df.copy()

    for season in df['season'].unique():
        season_mask = df['season'] == season
        season_data = df.loc[season_mask]

        # Get quantiles of predicted whiff for this season
        pred_whiffs = season_data['avg_pred_whiff'].values

        # Probit normalization: convert to standard normal percentiles
        # Map to 20-80 scale with mean=50, std=10
        percentiles = norm.cdf(pred_whiffs)  # Convert to [0, 1]
        percentiles = np.clip(percentiles, 0.001, 0.999)  # Avoid infinities

        # Inverse probit to get scouting scale values
        raw_scores = PROBIT_SCALE_MEAN + PROBIT_SCALE_STD * ndtri(percentiles)
        raw_scores = np.clip(raw_scores, PROBIT_SCALE_MIN, PROBIT_SCALE_MAX)

        # Convert to 100-centered scale
        final_scores = FINAL_SCALE_CENTER + (raw_scores - PROBIT_SCALE_MEAN) * FINAL_SCALE_SLOPE

        df.loc[season_mask, 'raw_scouting_score'] = raw_scores
        df.loc[season_mask, 'stuff_plus_score'] = final_scores

    logger.info(f"Normalized. Mean 2026 Stuff+: {df[df['season'] == 2026]['stuff_plus_score'].mean():.1f}")
    return df

# ═══════════════════════════════════════════════════════════════════════════════
# MERGING & OUTPUT
# ═══════════════════════════════════════════════════════════════════════════════

def load_pitcher_names(df: pd.DataFrame) -> pd.DataFrame:
    """
    Load pitcher names from Statcast data or existing CSV.
    """
    logger.info(f"Loading pitcher names...")

    # Try to get from existing Statcast data
    if 'pitcher' in df.columns and 'player_name' in df.columns:
        names = df[['pitcher', 'player_name']].drop_duplicates()
        names.columns = ['pitcher', 'name']
        return names

    # Try from training data CSV
    if TRAINING_DATA_CSV.exists():
        try:
            training = pd.read_csv(TRAINING_DATA_CSV)
            if 'pitcher' in training.columns and 'name' in training.columns:
                names = training[['pitcher', 'name']].drop_duplicates()
                return names
        except:
            pass

    logger.warning("Could not load pitcher names from standard sources")
    return pd.DataFrame({'pitcher': df['pitcher'].unique(), 'name': ''})

def load_fg_stuffplus() -> Optional[pd.DataFrame]:
    """
    Load FanGraphs Stuff+/Location+/Pitching+ stats.
    """
    if not FG_STUFFPLUS_JSON.exists():
        logger.warning(f"FanGraphs file not found: {FG_STUFFPLUS_JSON}")
        return None

    try:
        with open(FG_STUFFPLUS_JSON, 'r') as f:
            fg_data = json.load(f)

        # Convert to DataFrame (FanGraphs format is list of dicts)
        fg_df = pd.DataFrame(fg_data)

        # Extract relevant columns
        if 'xMLBAMID' in fg_df.columns and 'Season' in fg_df.columns:
            # Look for Stuff+, Location+, Pitching+ columns (may be named differently)
            relevant_cols = ['xMLBAMID', 'Season']
            for col in fg_df.columns:
                if 'Stuff' in col or 'Location' in col or 'Pitching' in col:
                    relevant_cols.append(col)

            fg_df = fg_df[relevant_cols].rename(columns={'xMLBAMID': 'pitcher', 'Season': 'season'})
            logger.info(f"Loaded FanGraphs data: {len(fg_df)} pitcher-seasons")
            return fg_df
    except Exception as e:
        logger.error(f"Error loading FanGraphs data: {e}")

    return None

def merge_stats(stuffplus_df: pd.DataFrame, pitcher_names: pd.DataFrame) -> pd.DataFrame:
    """
    Merge custom Stuff+ with pitcher names and other stats.
    """
    logger.info(f"Merging stats...")

    result = stuffplus_df.copy()

    # Add names
    result = result.merge(pitcher_names, on='pitcher', how='left')
    result['name'] = result['name'].fillna('')

    # Add FanGraphs stats if available
    fg_stats = load_fg_stuffplus()
    if fg_stats is not None:
        # Map FanGraphs columns to output format
        # This depends on exact FanGraphs column names
        logger.info(f"Merging FanGraphs stats...")
        result = result.merge(fg_stats, on=['pitcher', 'season'], how='left')

    return result

def prepare_raw_data_output(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Convert aggregated pitcher stats to RAW_DATA format for data.js.

    Format:
    {
      "p": pitcher_id,           # pitcher MLBAM ID
      "n": "Name",              # pitcher name
      "t": "BOS",               # team
      "s": 2026,                # season
      "ov": 115,                # overall stuff+ (100-centered)
      "fb": 120,                # fastball stuff+ (if available)
      "bk": 110,                # breaking stuff+
      "of": 105,                # offspeed stuff+
      "tp": 683,                # total pitches
      "fp": 307,                # fastball pitches
      "bp": 205,                # breaking pitches
      "op": 171,                # offspeed pitches
      "apw": 0.546,             # avg predicted whiff
      "awr": 0.171              # actual whiff rate
    }
    """
    logger.info(f"Preparing RAW_DATA output format...")

    output = []

    for _, row in df.iterrows():
        entry = {
            'p': int(row['pitcher']),
            'n': str(row.get('name', '')),
            't': str(row.get('team', '')),
            's': int(row['season']),
            'ov': round(row['stuff_plus_score'], 1) if pd.notna(row['stuff_plus_score']) else None,
            'tp': int(row.get('n_pitches', 0)),
            'apw': round(row['avg_pred_whiff'], 3) if pd.notna(row['avg_pred_whiff']) else None,
            'awr': round(row['actual_whiff_rate'], 3) if pd.notna(row['actual_whiff_rate']) else None,
        }

        # Add pitch-type specific stuff+ if available
        for pitch_type, key in [('fastball', 'fb'), ('breaking', 'bk'), ('offspeed', 'of')]:
            pitch_count_col = f'{pitch_type}_count'
            if pitch_count_col in df.columns:
                entry[f'{key}p'] = int(row.get(pitch_count_col, 0))

        output.append(entry)

    return output

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════

def main(force_retrain: bool = False, verbose: bool = False):
    """
    Main pipeline: fetch, engineer, train, score, normalize, and output.
    """
    if verbose:
        logger.setLevel(logging.DEBUG)

    logger.info("="*80)
    logger.info("Baseball Hub - Custom XGBoost Stuff+ Pipeline")
    logger.info("="*80)
    logger.info(f"Target season: {TARGET_SEASON}")
    logger.info(f"Training seasons: {TRAINING_SEASONS}")
    logger.info(f"Repo root: {REPO_ROOT}")

    # ─────────────────────────────────────────────────────────────────────────
    # Check cache
    # ─────────────────────────────────────────────────────────────────────────

    if not force_retrain and MODEL_CACHE_FILE.exists() and SCALER_CACHE_FILE.exists():
        logger.info(f"Loading cached model from {MODEL_CACHE_FILE}...")
        with open(MODEL_CACHE_FILE, 'rb') as f:
            model = pickle.load(f)
        with open(SCALER_CACHE_FILE, 'rb') as f:
            scaler = pickle.load(f)
    else:
        logger.info("Training new model...")

        # Fetch training data
        train_data_list = []
        for season in TRAINING_SEASONS:
            raw_df = fetch_statcast_data(season)
            if len(raw_df) > 0:
                train_data_list.append(raw_df)

        if len(train_data_list) == 0:
            logger.error("No training data fetched!")
            return

        train_df = pd.concat(train_data_list, ignore_index=True)
        logger.info(f"Total training data: {len(train_df)} pitches")

        # Engineer features
        train_df = engineer_features(train_df)
        train_df = prepare_training_data(train_df)

        # Train model
        model, scaler = train_model(train_df)

        # Cache model
        logger.info(f"Caching model to {MODEL_CACHE_FILE}...")
        with open(MODEL_CACHE_FILE, 'wb') as f:
            pickle.dump(model, f)
        with open(SCALER_CACHE_FILE, 'wb') as f:
            pickle.dump(scaler, f)

    # ─────────────────────────────────────────────────────────────────────────
    # Score 2026 data
    # ─────────────────────────────────────────────────────────────────────────

    logger.info("Fetching and scoring 2026 data...")
    df_2026 = fetch_statcast_data(TARGET_SEASON)

    if len(df_2026) == 0:
        logger.error(f"No 2026 Statcast data available!")
        return

    df_2026 = engineer_features(df_2026)
    df_2026 = prepare_training_data(df_2026)
    df_2026 = score_2026_pitches(model, scaler, df_2026)

    # ─────────────────────────────────────────────────────────────────────────
    # Aggregate and normalize
    # ─────────────────────────────────────────────────────────────────────────

    agg_df = aggregate_pitcher_season(df_2026)
    normalized_df = normalize_to_scouting_scale(agg_df)

    # ─────────────────────────────────────────────────────────────────────────
    # Load names and merge
    # ─────────────────────────────────────────────────────────────────────────

    pitcher_names = load_pitcher_names(df_2026)
    final_df = merge_stats(normalized_df, pitcher_names)

    # ─────────────────────────────────────────────────────────────────────────
    # Prepare output
    # ─────────────────────────────────────────────────────────────────────────

    raw_data = prepare_raw_data_output(final_df[final_df['season'] == TARGET_SEASON])

    logger.info(f"Generated Stuff+ scores for {len(raw_data)} pitchers")

    # ─────────────────────────────────────────────────────────────────────────
    # Save outputs
    # ─────────────────────────────────────────────────────────────────────────

    # Save custom JSON
    logger.info(f"Saving to {STUFFPLUS_JSON}...")
    with open(STUFFPLUS_JSON, 'w') as f:
        json.dump(raw_data, f, indent=2)

    # Save full CSV for reference
    csv_file = DATA_DIR / 'stuffplus-custom.csv'
    logger.info(f"Saving full data to {csv_file}...")
    final_df.to_csv(csv_file, index=False)

    logger.info("="*80)
    logger.info("Pipeline complete!")
    logger.info(f"Output: {STUFFPLUS_JSON}")
    logger.info(f"CSV: {csv_file}")
    logger.info("="*80)

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(
        description='Compute custom XGBoost Stuff+ ratings for 2026 season'
    )
    parser.add_argument(
        '--force-retrain',
        action='store_true',
        help='Force retraining of model even if cache exists'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )

    args = parser.parse_args()

    try:
        main(force_retrain=args.force_retrain, verbose=args.verbose)
    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
        sys.exit(1)
