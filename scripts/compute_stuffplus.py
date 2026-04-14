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
5. Normalize with rank-based probit (mean=50, std=10) per season on 20-80 scale
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
from scipy.stats import norm, rankdata
from scipy.special import ndtri

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
FEATURE_COLS_FILE = DATA_DIR / 'model_cache' / 'stuffplus_features.json'

# Output files
STUFFPLUS_JSON = DATA_DIR / 'stuffplus-custom.json'
DATA_JS = JS_DIR / 'data.js'

# FanGraphs Stuff+ reference (for merging comparison stats)
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

# Statcast "description" values that count as swinging strikes (whiffs)
WHIFF_DESCRIPTIONS = {
    'swinging_strike', 'swinging_strike_blocked',
    'foul_tip',  # foul tips are swinging strikes that go to catcher
    'swinging_pitchout',
}

# Descriptions that count as any swing
SWING_DESCRIPTIONS = {
    'swinging_strike', 'swinging_strike_blocked', 'foul_tip',
    'foul', 'foul_bunt', 'hit_into_play', 'hit_into_play_no_out',
    'hit_into_play_score', 'swinging_pitchout',
    'missed_bunt', 'bunt_foul_tip',
}

# Batch size for Statcast queries (avoid timeouts)
STATCAST_BATCH_DAYS = 14

# ═══════════════════════════════════════════════════════════════════════════════
# FEATURE ENGINEERING (Vectorized)
# ═══════════════════════════════════════════════════════════════════════════════

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Engineer all 5 feature dimensions (vectorized for performance):
    1. Velocity & Movement Differentials
    2. Tunneling
    3. Sequencing
    4. Deception
    5. Whiff/Chase Metrics

    Returns DataFrame with engineered features added.
    """
    df = df.copy()
    logger.info(f"Engineering features for {len(df):,} pitches...")

    # Ensure required numeric columns exist and are numeric
    for col in ['release_speed', 'pfx_x', 'pfx_z', 'x0', 'z0', 'y0',
                'vx0', 'vz0', 'plate_x', 'plate_z', 'extension',
                'px', 'pz']:
        if col not in df.columns:
            df[col] = np.nan
        df[col] = pd.to_numeric(df[col], errors='coerce')

    if 'pitch_type' not in df.columns:
        df['pitch_type'] = 'UN'

    # ─────────────────────────────────────────────────────────────────────────
    # 1. VELOCITY & MOVEMENT DIFFERENTIALS
    # ─────────────────────────────────────────────────────────────────────────

    # For each pitcher, find their primary fastball type and velocity/movement
    fb_mask = df['pitch_type'].isin(FASTBALL_TYPES)
    pitcher_fb = df[fb_mask].groupby('pitcher').agg(
        primary_fb_type=('pitch_type', lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else 'FF'),
        primary_fb_velo=('release_speed', 'mean'),
        primary_fb_pfx_x=('pfx_x', 'mean'),
        primary_fb_pfx_z=('pfx_z', 'mean'),
        primary_fb_vx0=('vx0', 'mean'),
        primary_fb_vz0=('vz0', 'mean'),
        primary_fb_x0=('x0', 'mean'),
        primary_fb_z0=('z0', 'mean'),
    )

    df = df.merge(pitcher_fb, left_on='pitcher', right_index=True, how='left')

    # Velocity differential: fastball velo - this pitch velo
    df['velo_diff'] = (df['primary_fb_velo'] - df['release_speed']).fillna(0)

    # Horizontal movement differential
    df['hmov_diff'] = (df['primary_fb_pfx_x'] - df['pfx_x']).fillna(0)

    # Vertical movement differential
    df['vmov_diff'] = (df['primary_fb_pfx_z'] - df['pfx_z']).fillna(0)

    # ─────────────────────────────────────────────────────────────────────────
    # 2. TUNNELING (vectorized)
    # ─────────────────────────────────────────────────────────────────────────

    # Release point spread per pitcher (std of release point across all pitches)
    rp_stats = df.groupby('pitcher').agg(
        rp_x_std=('x0', 'std'),
        rp_z_std=('z0', 'std'),
    ).fillna(0)

    df = df.merge(rp_stats, left_on='pitcher', right_index=True, how='left')
    df['release_point_spread'] = np.sqrt(
        df['rp_x_std'] ** 2 + df['rp_z_std'] ** 2
    ).fillna(0)

    # Tunnel difference from fastball: Euclidean distance in release space
    df['tunnel_diff_from_fb'] = np.sqrt(
        (df['x0'] - df['primary_fb_x0']) ** 2 +
        (df['z0'] - df['primary_fb_z0']) ** 2 +
        ((df['release_speed'] - df['primary_fb_velo']) / 10) ** 2
    ).fillna(0)

    # Early trajectory similarity: cosine similarity of (vx0, vz0) to pitcher's FB avg
    # Vectorized: cos_sim = (a·b) / (|a|*|b|)
    dot_product = (df['vx0'] * df['primary_fb_vx0'] +
                   df['vz0'] * df['primary_fb_vz0'])
    norm_pitch = np.sqrt(df['vx0'] ** 2 + df['vz0'] ** 2)
    norm_fb = np.sqrt(df['primary_fb_vx0'] ** 2 + df['primary_fb_vz0'] ** 2)
    denominator = norm_pitch * norm_fb
    df['early_trajectory_sim'] = np.where(
        denominator > 0, dot_product / denominator, 0.0
    )
    df['early_trajectory_sim'] = df['early_trajectory_sim'].fillna(0)

    # ─────────────────────────────────────────────────────────────────────────
    # 3. SEQUENCING
    # ─────────────────────────────────────────────────────────────────────────

    # Sort by pitcher → game → at-bat → pitch number for proper sequencing
    sort_cols = []
    for c in ['pitcher', 'game_date', 'inning', 'at_bat_number', 'pitch_number']:
        if c in df.columns:
            sort_cols.append(c)
    if not sort_cols:
        sort_cols = ['pitcher']
    df = df.sort_values(sort_cols).reset_index(drop=True)

    # Previous pitch type and speed (within same pitcher only)
    df['prev_release_speed'] = df.groupby('pitcher')['release_speed'].shift(1)

    # Pitch type encoding
    all_pitch_types = df['pitch_type'].dropna().unique()
    pitch_type_map = {pt: i for i, pt in enumerate(all_pitch_types)}
    df['pitch_type_enc'] = df['pitch_type'].map(pitch_type_map).fillna(-1).astype(int)
    df['prev_pitch_type'] = df.groupby('pitcher')['pitch_type'].shift(1)
    df['prev_pitch_type_enc'] = df['prev_pitch_type'].map(pitch_type_map).fillna(-1).astype(int)

    # Velocity change from previous pitch
    df['seq_velo_change'] = (df['release_speed'] - df['prev_release_speed']).fillna(0)

    # Movement changes from previous pitch
    df['prev_pfx_x'] = df.groupby('pitcher')['pfx_x'].shift(1)
    df['prev_pfx_z'] = df.groupby('pitcher')['pfx_z'].shift(1)
    df['seq_hmov_change'] = (df['pfx_x'] - df['prev_pfx_x']).fillna(0)
    df['seq_vmov_change'] = (df['pfx_z'] - df['prev_pfx_z']).fillna(0)

    # Location shift from previous pitch
    df['prev_plate_x'] = df.groupby('pitcher')['plate_x'].shift(1)
    df['prev_plate_z'] = df.groupby('pitcher')['plate_z'].shift(1)
    df['seq_location_shift'] = np.sqrt(
        (df['plate_x'] - df['prev_plate_x']) ** 2 +
        (df['plate_z'] - df['prev_plate_z']) ** 2
    ).fillna(0)

    # Pitcher entropy: Shannon entropy of pitch type distribution per pitcher
    pitch_counts = df.groupby(['pitcher', 'pitch_type']).size().unstack(fill_value=0)
    pitch_probs = pitch_counts.div(pitch_counts.sum(axis=1), axis=0)
    # Shannon entropy: -sum(p * log2(p))
    pitcher_entropy = -(pitch_probs * np.log2(pitch_probs.clip(lower=1e-10))).sum(axis=1)
    pitcher_entropy.name = 'pitcher_entropy'
    df = df.merge(pitcher_entropy, left_on='pitcher', right_index=True, how='left')
    df['pitcher_entropy'] = df['pitcher_entropy'].fillna(0)

    # Transition surprise: -log2(P(this_pitch_type | prev_pitch_type)) per pitcher
    # Compute transition probability matrix per pitcher
    valid_transitions = df[df['prev_pitch_type'].notna()].copy()
    if len(valid_transitions) > 0:
        trans_counts = valid_transitions.groupby(
            ['pitcher', 'prev_pitch_type', 'pitch_type']
        ).size().reset_index(name='count')
        trans_totals = valid_transitions.groupby(
            ['pitcher', 'prev_pitch_type']
        ).size().reset_index(name='total')
        trans_probs = trans_counts.merge(trans_totals, on=['pitcher', 'prev_pitch_type'])
        trans_probs['trans_prob'] = trans_probs['count'] / trans_probs['total']
        trans_probs['transition_surprise'] = -np.log2(trans_probs['trans_prob'].clip(lower=1e-10))

        # Merge back: match on (pitcher, prev_pitch_type, pitch_type)
        df = df.merge(
            trans_probs[['pitcher', 'prev_pitch_type', 'pitch_type', 'transition_surprise']],
            on=['pitcher', 'prev_pitch_type', 'pitch_type'],
            how='left'
        )
    else:
        df['transition_surprise'] = 0.0
    df['transition_surprise'] = df['transition_surprise'].fillna(0)

    # ─────────────────────────────────────────────────────────────────────────
    # 4. DECEPTION
    # ─────────────────────────────────────────────────────────────────────────

    # Perceived velocity: extension-adjusted
    pitcher_ext = df.groupby('pitcher')['extension'].mean().rename('avg_extension')
    df = df.merge(pitcher_ext, left_on='pitcher', right_index=True, how='left')
    df['extension_vs_avg'] = (df['extension'] - df['avg_extension']).fillna(0)
    # Longer extension = pitch reaches hitter sooner = higher perceived velocity
    df['perceived_velocity'] = df['release_speed'] + (df['extension_vs_avg'] * 1.5)

    # Vertical Approach Angle (VAA)
    # VAA = atan2(vz at plate, vy at plate) — approximated from release to plate
    dz = (df['plate_z'].fillna(df['pz'].fillna(2.5)) - df['z0'].fillna(5.5))
    dy = (df['y0'].fillna(55) - 17.0 / 12)  # y0 is release distance; plate is ~1.42 ft from backstop
    df['VAA'] = np.degrees(np.arctan2(dz, dy)).fillna(0)

    # Horizontal Approach Angle (HAA)
    dx = (df['plate_x'].fillna(df['px'].fillna(0)) - df['x0'].fillna(0))
    df['HAA'] = np.degrees(np.arctan2(dx, dy)).fillna(0)

    # ─────────────────────────────────────────────────────────────────────────
    # 5. WHIFF / CHASE METRICS
    # ─────────────────────────────────────────────────────────────────────────

    desc = df['description'].fillna('').str.lower()

    # is_whiff: swinging_strike, swinging_strike_blocked, foul_tip
    df['is_whiff'] = desc.isin(WHIFF_DESCRIPTIONS).astype(int)

    # is_swing: any swinging event
    df['is_swing'] = desc.isin(SWING_DESCRIPTIONS).astype(int)

    # is_called_strike
    df['is_called_strike'] = desc.str.contains('called_strike', na=False).astype(int)

    # CSW (called strike + whiff)
    df['is_csw'] = ((df['is_called_strike'] == 1) | (df['is_whiff'] == 1)).astype(int)

    # is_in_zone: Statcast zones 1-9 are in the strike zone
    df['is_in_zone'] = 0
    if 'zone' in df.columns:
        zone_num = pd.to_numeric(df['zone'], errors='coerce')
        df['is_in_zone'] = (zone_num.between(1, 9)).astype(int).fillna(0).astype(int)

    # is_chase: swing outside the zone
    df['is_chase'] = ((df['is_swing'] == 1) & (df['is_in_zone'] == 0)).astype(int)

    logger.info(f"Engineered features for {len(df):,} pitches "
                f"(whiff rate: {df['is_whiff'].mean():.3f}, swing rate: {df['is_swing'].mean():.3f})")
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
    if season == TARGET_SEASON:
        # For current season, only fetch up to yesterday
        season_start = f"{season}-03-20"
        yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        season_end = yesterday
    else:
        season_start = f"{season}-03-20"
        season_end = f"{season}-11-01"

    all_data = []
    current_date = datetime.strptime(season_start, '%Y-%m-%d')
    end_date = datetime.strptime(season_end, '%Y-%m-%d')

    batch_num = 0
    while current_date < end_date:
        batch_end_date = min(
            current_date + timedelta(days=STATCAST_BATCH_DAYS),
            end_date
        )
        batch_start = current_date.strftime('%Y-%m-%d')
        batch_end = batch_end_date.strftime('%Y-%m-%d')

        try:
            logger.info(f"  Fetching {season} batch {batch_num + 1}: {batch_start} to {batch_end}...")
            batch_data = statcast(start_dt=batch_start, end_dt=batch_end)

            if batch_data is not None and len(batch_data) > 0:
                batch_data['season'] = season
                all_data.append(batch_data)
                logger.info(f"    Got {len(batch_data):,} pitches")
            else:
                logger.info(f"    No data for this batch")
        except Exception as e:
            logger.error(f"  Error fetching {batch_start} to {batch_end}: {e}")

        current_date = batch_end_date
        batch_num += 1

    if len(all_data) == 0:
        logger.warning(f"No Statcast data found for season {season}")
        return pd.DataFrame()

    result = pd.concat(all_data, ignore_index=True)

    # Deduplicate (overlapping batch boundaries can cause dupes)
    id_cols = [c for c in ['game_pk', 'at_bat_number', 'pitch_number', 'pitcher', 'batter']
               if c in result.columns]
    if id_cols:
        result = result.drop_duplicates(subset=id_cols, keep='first')

    logger.info(f"Total: {len(result):,} pitches for {season}")
    return result

def prepare_training_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare training data from raw Statcast.
    Filters to valid pitchers with reasonable sample sizes.
    """
    logger.info(f"Preparing training data...")

    # Filter to pitchers with reasonable sample
    pitcher_counts = df['pitcher'].value_counts()
    min_pitches = 50
    valid_pitchers = pitcher_counts[pitcher_counts >= min_pitches].index
    df = df[df['pitcher'].isin(valid_pitchers)].copy()

    logger.info(f"{len(df):,} pitches from {df['pitcher'].nunique()} pitchers after filtering")
    return df

# ═══════════════════════════════════════════════════════════════════════════════
# MODEL TRAINING
# ═══════════════════════════════════════════════════════════════════════════════

# The feature columns used for the XGBoost model
FEATURE_COLS = [
    # Velocity & Movement Differentials
    'velo_diff', 'hmov_diff', 'vmov_diff',
    # Tunneling
    'release_point_spread', 'tunnel_diff_from_fb', 'early_trajectory_sim',
    # Sequencing
    'seq_velo_change', 'seq_hmov_change', 'seq_vmov_change', 'seq_location_shift',
    'pitcher_entropy', 'transition_surprise',
    # Deception
    'perceived_velocity', 'VAA', 'HAA', 'extension_vs_avg',
    # Raw pitch characteristics
    'release_speed', 'pfx_x', 'pfx_z',
    # Context
    'pitch_type_enc', 'prev_pitch_type_enc',
    'is_in_zone',
]

def train_model(train_df: pd.DataFrame) -> Tuple[xgb.XGBClassifier, StandardScaler, List[str]]:
    """
    Train XGBoost model on historical data.
    Returns: (model, scaler, feature_list)
    """
    logger.info(f"Training XGBoost model on {len(train_df):,} pitches...")

    # Keep only features available in this dataset
    available_features = [col for col in FEATURE_COLS if col in train_df.columns]
    logger.info(f"Using {len(available_features)} features: {available_features}")

    X = train_df[available_features].fillna(0).astype(np.float32)
    y = train_df['is_whiff'].fillna(0).astype(int)

    logger.info(f"Target distribution: {y.mean():.4f} whiff rate ({y.sum():,} whiffs / {len(y):,} pitches)")

    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train XGBoost
    model = xgb.XGBClassifier(
        n_estimators=500,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=50,
        random_state=42,
        n_jobs=-1,
        tree_method='hist',
        verbosity=0,
        eval_metric='logloss',
    )

    model.fit(X_scaled, y, verbose=False)

    logger.info(f"Model trained. Feature importance (top 10):")
    importances = dict(zip(available_features, model.feature_importances_))
    for feat, imp in sorted(importances.items(), key=lambda x: x[1], reverse=True)[:10]:
        logger.info(f"  {feat}: {imp:.4f}")

    return model, scaler, available_features

# ═══════════════════════════════════════════════════════════════════════════════
# SCORING & AGGREGATION
# ═══════════════════════════════════════════════════════════════════════════════

def score_pitches(
    model: xgb.XGBClassifier,
    scaler: StandardScaler,
    df: pd.DataFrame,
    feature_cols: List[str],
) -> pd.DataFrame:
    """
    Score pitches with trained model.
    Returns: df with 'pred_whiff_prob' column added.
    """
    logger.info(f"Scoring {len(df):,} pitches...")

    available = [col for col in feature_cols if col in df.columns]
    missing = set(feature_cols) - set(available)
    if missing:
        logger.warning(f"Missing features (will be filled with 0): {missing}")
        for col in missing:
            df[col] = 0

    X = df[feature_cols].fillna(0).astype(np.float32)
    X_scaled = scaler.transform(X)

    df = df.copy()
    df['pred_whiff_prob'] = model.predict_proba(X_scaled)[:, 1]

    logger.info(f"Scored pitches. Mean predicted whiff: {df['pred_whiff_prob'].mean():.4f}")
    return df

def aggregate_pitcher_season(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate predicted whiff rate per pitcher-season,
    including pitch-type breakdowns.
    """
    logger.info(f"Aggregating by pitcher-season...")

    # Overall aggregation
    overall = df.groupby(['pitcher', 'season']).agg(
        avg_pred_whiff=('pred_whiff_prob', 'mean'),
        actual_whiff_rate=('is_whiff', 'mean'),
        n_pitches=('is_whiff', 'count'),
        n_whiffs=('is_whiff', 'sum'),
    ).reset_index()

    # Pitch-type breakdowns
    for category_name, types in [('fastball', FASTBALL_TYPES), ('breaking', BREAKING_TYPES), ('offspeed', OFFSPEED_TYPES)]:
        cat_data = df[df['pitch_type'].isin(types)].groupby(['pitcher', 'season']).agg(
            count=('pred_whiff_prob', 'count'),
            whiff_pred=('pred_whiff_prob', 'mean'),
        ).reset_index()
        cat_data.columns = ['pitcher', 'season', f'{category_name}_count', f'{category_name}_whiff']
        overall = overall.merge(cat_data, on=['pitcher', 'season'], how='left')

    overall = overall.fillna(0)

    # Get pitcher names and most recent team from the raw data
    pitcher_info = df.groupby(['pitcher', 'season']).agg(
        name=('player_name', 'first') if 'player_name' in df.columns else ('pitcher', 'first'),
        team=('home_team', 'first') if 'home_team' in df.columns else ('pitcher', 'first'),
    ).reset_index()

    # Try to get better team info: the team the pitcher pitched FOR (not against)
    if 'pitcher' in df.columns and 'p_throws' in df.columns:
        # pitcher_team is the team of the pitcher
        pass  # team info handled below

    overall = overall.merge(pitcher_info[['pitcher', 'season', 'name']], on=['pitcher', 'season'], how='left')

    logger.info(f"Aggregated to {len(overall)} pitcher-seasons")
    return overall

def get_pitcher_teams(df: pd.DataFrame) -> pd.DataFrame:
    """
    Determine the team each pitcher played for in each season.
    Uses the most common 'pitcher_team' (inning_topbot logic) from Statcast.
    """
    if 'inning_topbot' not in df.columns or 'home_team' not in df.columns or 'away_team' not in df.columns:
        logger.warning("Cannot determine pitcher teams - missing columns")
        return pd.DataFrame(columns=['pitcher', 'season', 'team'])

    df = df.copy()
    # When pitcher is home and batting team is "Top" (visitors batting), pitcher is home team
    # When pitcher is home and batting team is "Bot", pitcher is away team
    df['pitcher_team'] = np.where(
        df['inning_topbot'] == 'Top',
        df['home_team'],
        df['away_team']
    )

    # Most common team per pitcher-season
    teams = df.groupby(['pitcher', 'season'])['pitcher_team'].agg(
        lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else ''
    ).reset_index()
    teams.columns = ['pitcher', 'season', 'team']
    return teams


def normalize_to_scouting_scale(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize predictions to 20-80 scouting scale using RANK-BASED probit transformation.
    Then convert to 100-centered scale: 100 + (raw - 50) * 1.5

    This matches the methodology from pitcher_leaderboard_v1.csv where each season
    has mean=50.0, std=10.0 on the 20-80 scale.

    Steps per season:
    1. Rank all pitchers by avg_pred_whiff
    2. Convert ranks to percentiles [0, 1]
    3. Apply inverse normal CDF (probit) → z-scores
    4. Scale to mean=50, std=10 on the 20-80 scale
    5. Convert to 100-centered: 100 + (raw - 50) * 1.5
    """
    logger.info(f"Normalizing to scouting scale (rank-based probit)...")

    df = df.copy()

    for season in df['season'].unique():
        season_mask = df['season'] == season
        n = season_mask.sum()
        if n < 2:
            df.loc[season_mask, 'raw_scouting_score'] = PROBIT_SCALE_MEAN
            df.loc[season_mask, 'stuff_plus_score'] = FINAL_SCALE_CENTER
            continue

        # Get avg_pred_whiff values for this season
        values = df.loc[season_mask, 'avg_pred_whiff'].values

        # Step 1: Rank (higher predicted whiff = better "stuff" = higher rank)
        ranks = rankdata(values, method='average')

        # Step 2: Convert ranks to percentiles (0, 1) — avoid exact 0 or 1
        percentiles = (ranks - 0.5) / n

        # Step 3: Apply inverse normal CDF (probit transform)
        z_scores = ndtri(percentiles)

        # Step 4: Scale to 20-80 scouting scale (mean=50, std=10)
        raw_scores = PROBIT_SCALE_MEAN + PROBIT_SCALE_STD * z_scores
        raw_scores = np.clip(raw_scores, PROBIT_SCALE_MIN, PROBIT_SCALE_MAX)

        # Step 5: Convert to 100-centered scale
        final_scores = FINAL_SCALE_CENTER + (raw_scores - PROBIT_SCALE_MEAN) * FINAL_SCALE_SLOPE

        df.loc[season_mask, 'raw_scouting_score'] = raw_scores
        df.loc[season_mask, 'stuff_plus_score'] = final_scores

        logger.info(f"  Season {season}: n={n}, "
                    f"raw_score mean={raw_scores.mean():.1f} std={raw_scores.std():.1f}, "
                    f"stuff+ mean={final_scores.mean():.1f} std={final_scores.std():.1f}")

    return df

def normalize_pitch_type_scores(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize pitch-type-specific whiff predictions to 100-centered scale.
    Same rank-based probit as overall, but computed per pitch category per season.
    """
    df = df.copy()

    for category in ['fastball', 'breaking', 'offspeed']:
        whiff_col = f'{category}_whiff'
        count_col = f'{category}_count'
        score_col = f'{category}_stuff_plus'

        if whiff_col not in df.columns:
            df[score_col] = None
            continue

        df[score_col] = np.nan

        for season in df['season'].unique():
            # Only score pitchers who actually threw this pitch type
            mask = (df['season'] == season) & (df[count_col] > 0)
            n = mask.sum()
            if n < 2:
                continue

            values = df.loc[mask, whiff_col].values
            ranks = rankdata(values, method='average')
            percentiles = (ranks - 0.5) / n
            z_scores = ndtri(percentiles)
            raw_scores = np.clip(PROBIT_SCALE_MEAN + PROBIT_SCALE_STD * z_scores,
                                 PROBIT_SCALE_MIN, PROBIT_SCALE_MAX)
            final_scores = FINAL_SCALE_CENTER + (raw_scores - PROBIT_SCALE_MEAN) * FINAL_SCALE_SLOPE
            df.loc[mask, score_col] = final_scores

    return df


# ═══════════════════════════════════════════════════════════════════════════════
# MERGING & OUTPUT
# ═══════════════════════════════════════════════════════════════════════════════

def load_fg_stuffplus() -> Optional[pd.DataFrame]:
    """
    Load FanGraphs Stuff+/Location+/Pitching+ for 2026 comparison.
    """
    if not FG_STUFFPLUS_JSON.exists():
        logger.warning(f"FanGraphs file not found: {FG_STUFFPLUS_JSON}")
        return None

    try:
        with open(FG_STUFFPLUS_JSON, 'r') as f:
            fg_data = json.load(f)

        fg_df = pd.DataFrame(fg_data)

        # Map to standard column names
        rename_map = {}
        if 'xMLBAMID' in fg_df.columns:
            rename_map['xMLBAMID'] = 'fg_mlbam_id'
        elif 'MLBAMID' in fg_df.columns:
            rename_map['MLBAMID'] = 'fg_mlbam_id'

        # Find Stuff+, Location+, Pitching+ columns
        for col in fg_df.columns:
            if col == 'sp_stuff' or col == 'Stuff+':
                rename_map[col] = 'fg_stuff_plus'
            elif col == 'sp_location' or col == 'Location+':
                rename_map[col] = 'fg_location_plus'
            elif col == 'sp_pitching' or col == 'Pitching+':
                rename_map[col] = 'fg_pitching_plus'

        fg_df = fg_df.rename(columns=rename_map)

        if 'fg_mlbam_id' in fg_df.columns:
            fg_df['fg_mlbam_id'] = pd.to_numeric(fg_df['fg_mlbam_id'], errors='coerce')
            logger.info(f"Loaded FanGraphs Stuff+ data: {len(fg_df)} rows")
            return fg_df[['fg_mlbam_id', 'fg_stuff_plus', 'fg_location_plus', 'fg_pitching_plus']].copy()

    except Exception as e:
        logger.error(f"Error loading FanGraphs data: {e}")

    return None


def prepare_raw_data_output(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Convert aggregated pitcher stats to RAW_DATA format for data.js and stuffplus-custom.json.

    Format matches js/data.js RAW_DATA:
    {
      "p": pitcher_id,    "n": "Name",        "t": "BOS",        "s": 2026,
      "ov": 115,          "fb": 120,          "bk": 110,         "of": 105,
      "tp": 683,          "fp": 307,          "bp": 205,         "op": 171,
      "apw": 0.546,       "awr": 0.171,
      "fgs": null,        "fgl": null,        "fgp": null
    }
    """
    logger.info(f"Preparing RAW_DATA output format...")

    output = []
    for _, row in df.iterrows():
        entry = {
            'p': int(row['pitcher']),
            'n': str(row.get('name', '') or ''),
            't': str(row.get('team', '') or ''),
            's': int(row['season']),
            'ov': round(float(row['stuff_plus_score']), 1) if pd.notna(row.get('stuff_plus_score')) else None,
            'fb': round(float(row['fastball_stuff_plus']), 1) if pd.notna(row.get('fastball_stuff_plus')) else None,
            'bk': round(float(row['breaking_stuff_plus']), 1) if pd.notna(row.get('breaking_stuff_plus')) else None,
            'of': round(float(row['offspeed_stuff_plus']), 1) if pd.notna(row.get('offspeed_stuff_plus')) else None,
            'tp': int(row.get('n_pitches', 0)),
            'fp': int(row.get('fastball_count', 0)),
            'bp': int(row.get('breaking_count', 0)),
            'op': int(row.get('offspeed_count', 0)),
            'apw': round(float(row['avg_pred_whiff']), 4) if pd.notna(row.get('avg_pred_whiff')) else None,
            'awr': round(float(row['actual_whiff_rate']), 4) if pd.notna(row.get('actual_whiff_rate')) else None,
            # FanGraphs comparison values (may be null)
            'fgs': round(float(row['fg_stuff_plus']), 1) if pd.notna(row.get('fg_stuff_plus')) else None,
            'fgl': round(float(row['fg_location_plus']), 1) if pd.notna(row.get('fg_location_plus')) else None,
            'fgp': round(float(row['fg_pitching_plus']), 1) if pd.notna(row.get('fg_pitching_plus')) else None,
        }
        output.append(entry)

    return output


def update_data_js(new_2026_rows: List[Dict], existing_data_js: Path) -> None:
    """
    Update js/data.js by:
    1. Reading existing RAW_DATA (2020-2025)
    2. Removing any old 2026 rows
    3. Appending fresh 2026 rows from the custom model
    4. Writing back the full file
    """
    logger.info(f"Updating {existing_data_js}...")

    existing_rows = []
    if existing_data_js.exists():
        try:
            content = existing_data_js.read_text()
            # Extract JSON array from "var RAW_DATA = [...];"
            start = content.index('[')
            end = content.rindex(']') + 1
            existing_rows = json.loads(content[start:end])
            logger.info(f"  Read {len(existing_rows)} existing rows from data.js")
        except Exception as e:
            logger.error(f"  Error reading existing data.js: {e}")

    # Remove any existing 2026 rows
    kept_rows = [r for r in existing_rows if r.get('s') != TARGET_SEASON]
    logger.info(f"  Kept {len(kept_rows)} non-{TARGET_SEASON} rows")

    # Append new 2026 rows
    all_rows = kept_rows + new_2026_rows
    logger.info(f"  Total rows after merge: {len(all_rows)} ({len(new_2026_rows)} new for {TARGET_SEASON})")

    # Write back
    json_str = json.dumps(all_rows, separators=(',', ':'))
    existing_data_js.write_text(f"var RAW_DATA = {json_str};\n")
    logger.info(f"  Written {existing_data_js} ({len(all_rows)} rows)")


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════

def main(force_retrain: bool = False, verbose: bool = False):
    """
    Main pipeline: fetch, engineer, train, score, normalize, and output.
    """
    if verbose:
        logger.setLevel(logging.DEBUG)

    logger.info("=" * 80)
    logger.info("Baseball Hub — Custom XGBoost Stuff+ Pipeline")
    logger.info("=" * 80)
    logger.info(f"Target season: {TARGET_SEASON}")
    logger.info(f"Training seasons: {TRAINING_SEASONS}")
    logger.info(f"Repo root: {REPO_ROOT}")

    # ─────────────────────────────────────────────────────────────────────────
    # Step 1: Load or train model
    # ─────────────────────────────────────────────────────────────────────────

    if (not force_retrain
            and MODEL_CACHE_FILE.exists()
            and SCALER_CACHE_FILE.exists()
            and FEATURE_COLS_FILE.exists()):
        logger.info(f"Loading cached model from {MODEL_CACHE_FILE}...")
        with open(MODEL_CACHE_FILE, 'rb') as f:
            model = pickle.load(f)
        with open(SCALER_CACHE_FILE, 'rb') as f:
            scaler = pickle.load(f)
        with open(FEATURE_COLS_FILE, 'r') as f:
            feature_cols = json.load(f)
        logger.info(f"  Model loaded ({len(feature_cols)} features)")
    else:
        logger.info("Training new model on 2020-2025 data...")

        # Fetch training data season by season
        train_data_list = []
        for season in TRAINING_SEASONS:
            raw_df = fetch_statcast_data(season)
            if len(raw_df) > 0:
                train_data_list.append(raw_df)
                logger.info(f"  Season {season}: {len(raw_df):,} pitches")

        if len(train_data_list) == 0:
            logger.error("No training data fetched! Cannot train model.")
            sys.exit(1)

        train_df = pd.concat(train_data_list, ignore_index=True)
        logger.info(f"Total training data: {len(train_df):,} pitches across {len(train_data_list)} seasons")

        # Engineer features
        train_df = engineer_features(train_df)
        train_df = prepare_training_data(train_df)

        # Train model
        model, scaler, feature_cols = train_model(train_df)

        # Cache model + scaler + feature list
        logger.info(f"Caching model to {MODEL_CACHE_FILE}...")
        with open(MODEL_CACHE_FILE, 'wb') as f:
            pickle.dump(model, f)
        with open(SCALER_CACHE_FILE, 'wb') as f:
            pickle.dump(scaler, f)
        with open(FEATURE_COLS_FILE, 'w') as f:
            json.dump(feature_cols, f)

        # Clean up memory
        del train_df, train_data_list

    # ─────────────────────────────────────────────────────────────────────────
    # Step 2: Fetch and score 2026 data
    # ─────────────────────────────────────────────────────────────────────────

    logger.info("Fetching and scoring 2026 data...")
    df_2026 = fetch_statcast_data(TARGET_SEASON)

    if len(df_2026) == 0:
        logger.error(f"No {TARGET_SEASON} Statcast data available!")
        logger.error("The season may not have started yet, or Baseball Savant may be down.")
        sys.exit(1)

    df_2026 = engineer_features(df_2026)
    df_2026 = prepare_training_data(df_2026)
    df_2026 = score_pitches(model, scaler, df_2026, feature_cols)

    # ─────────────────────────────────────────────────────────────────────────
    # Step 3: Aggregate per pitcher-season
    # ─────────────────────────────────────────────────────────────────────────

    agg_df = aggregate_pitcher_season(df_2026)

    # Get team info
    teams_df = get_pitcher_teams(df_2026)
    if len(teams_df) > 0:
        agg_df = agg_df.merge(teams_df, on=['pitcher', 'season'], how='left')
    else:
        agg_df['team'] = ''

    # ─────────────────────────────────────────────────────────────────────────
    # Step 4: Normalize to scouting scale (rank-based probit)
    # ─────────────────────────────────────────────────────────────────────────

    normalized_df = normalize_to_scouting_scale(agg_df)
    normalized_df = normalize_pitch_type_scores(normalized_df)

    # ─────────────────────────────────────────────────────────────────────────
    # Step 5: Merge FanGraphs comparison data
    # ─────────────────────────────────────────────────────────────────────────

    fg_df = load_fg_stuffplus()
    if fg_df is not None:
        normalized_df = normalized_df.merge(
            fg_df, left_on='pitcher', right_on='fg_mlbam_id', how='left'
        )
        matched = normalized_df['fg_stuff_plus'].notna().sum()
        logger.info(f"Merged FG Stuff+ for {matched}/{len(normalized_df)} pitchers")
    else:
        normalized_df['fg_stuff_plus'] = None
        normalized_df['fg_location_plus'] = None
        normalized_df['fg_pitching_plus'] = None

    # ─────────────────────────────────────────────────────────────────────────
    # Step 6: Prepare output
    # ─────────────────────────────────────────────────────────────────────────

    output_df = normalized_df[normalized_df['season'] == TARGET_SEASON].copy()
    raw_data_2026 = prepare_raw_data_output(output_df)

    logger.info(f"Generated Stuff+ scores for {len(raw_data_2026)} pitchers")

    if len(raw_data_2026) > 0:
        # Show top 10 for sanity check
        sorted_output = sorted(raw_data_2026, key=lambda x: x.get('ov') or 0, reverse=True)
        logger.info("Top 10 Custom Stuff+ scores:")
        for i, row in enumerate(sorted_output[:10]):
            logger.info(f"  {i+1}. {row['n']} ({row['t']}): Stuff+={row['ov']}, "
                        f"PredWhiff={row['apw']}, ActWhiff={row['awr']}, "
                        f"FG Stuff+={row.get('fgs', 'N/A')}")

    # ─────────────────────────────────────────────────────────────────────────
    # Step 7: Save outputs
    # ─────────────────────────────────────────────────────────────────────────

    # Save custom JSON (used by leaderboard.js as primary source)
    logger.info(f"Saving to {STUFFPLUS_JSON}...")
    with open(STUFFPLUS_JSON, 'w') as f:
        json.dump(raw_data_2026, f, separators=(',', ':'))

    # Update js/data.js (merge 2026 into existing 2020-2025 data)
    update_data_js(raw_data_2026, DATA_JS)

    # Save full CSV for reference / debugging
    csv_file = DATA_DIR / 'stuffplus-custom.csv'
    logger.info(f"Saving full data to {csv_file}...")
    output_df.to_csv(csv_file, index=False)

    logger.info("=" * 80)
    logger.info("Pipeline complete!")
    logger.info(f"  Custom JSON: {STUFFPLUS_JSON} ({len(raw_data_2026)} pitchers)")
    logger.info(f"  data.js:     {DATA_JS} (updated with {TARGET_SEASON} rows)")
    logger.info(f"  CSV:         {csv_file}")
    logger.info("=" * 80)


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(
        description='Compute custom XGBoost Stuff+ ratings for the current season'
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
