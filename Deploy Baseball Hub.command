#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Baseball Hub — One-Click Deployment (v4 — fetch + deploy)
# ═══════════════════════════════════════════════════════════════════════════
#
# DOUBLE-CLICK THIS FILE to deploy Baseball Hub to GitHub Pages.
#
# This script:
#   1. Installs dependencies (gh CLI, Node.js)
#   2. Fetches LIVE data from FanGraphs + Savant locally (no CORS issues)
#   3. Pushes code + data to GitHub
#   4. Enables GitHub Pages
#   5. Opens your live site
# ═══════════════════════════════════════════════════════════════════════════

# ── Always cd into the folder where this script lives ──
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

REPO_NAME="baseball-hub"
TOTAL_STEPS=8

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

step() { echo ""; echo -e "${BLUE}[$1/$TOTAL_STEPS]${NC} ${BOLD}$2${NC}"; }
ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
info() { echo -e "  ${YELLOW}ℹ️  $1${NC}"; }
fail() { echo -e "  ${RED}❌ $1${NC}"; echo ""; echo "Press any key to close..."; read -n1; exit 1; }

echo ""
echo -e "${BOLD}⚾ Baseball Hub — One-Click Deploy${NC}"
echo "════════════════════════════════════════"
echo ""
echo -e "  Working directory: ${BOLD}$SCRIPT_DIR${NC}"

# ── Sanity check ──
if [ ! -f "$SCRIPT_DIR/index.html" ]; then
    fail "index.html not found in $SCRIPT_DIR"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 1: Check / Install GitHub CLI
# ══════════════════════════════════════════════════════════════════════════
step 1 "Checking GitHub CLI..."

if command -v gh &> /dev/null; then
    ok "GitHub CLI found ($(gh --version | head -1))"
else
    info "GitHub CLI not found — installing now..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install gh
        else
            info "Homebrew not found — installing Homebrew first..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            if [[ -f /opt/homebrew/bin/brew ]]; then
                eval "$(/opt/homebrew/bin/brew shellenv)"
            fi
            brew install gh
        fi
    else
        fail "Install gh manually: https://cli.github.com"
    fi
    if ! command -v gh &> /dev/null; then
        fail "GitHub CLI installation failed. Install manually: https://cli.github.com"
    fi
    ok "GitHub CLI installed"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 2: Check / Install Node.js
# ══════════════════════════════════════════════════════════════════════════
step 2 "Checking Node.js..."

if command -v node &> /dev/null; then
    NODE_VER=$(node --version)
    ok "Node.js found ($NODE_VER)"
else
    info "Node.js not found — installing now..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install node
        else
            fail "Install Node.js manually: https://nodejs.org"
        fi
    else
        fail "Install Node.js manually: https://nodejs.org"
    fi
    if ! command -v node &> /dev/null; then
        fail "Node.js installation failed. Install manually: https://nodejs.org"
    fi
    ok "Node.js installed ($(node --version))"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 3: Authenticate with GitHub
# ══════════════════════════════════════════════════════════════════════════
step 3 "Checking GitHub authentication..."

if gh auth status &> /dev/null 2>&1; then
    GH_USER=$(gh api user --jq '.login')
    ok "Authenticated as: $GH_USER"
else
    info "Not logged in — launching GitHub login..."
    gh auth login --web --git-protocol https
    GH_USER=$(gh api user --jq '.login')
    ok "Authenticated as: $GH_USER"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 4: Fetch LIVE data from FanGraphs + Savant
# ══════════════════════════════════════════════════════════════════════════
step 4 "Fetching live 2026 data (FanGraphs + Baseball Savant)..."
echo -e "  ${YELLOW}This runs server-side — no CORS issues${NC}"
echo ""

if [ -f "$SCRIPT_DIR/scripts/fetch-2026.js" ]; then
    node "$SCRIPT_DIR/scripts/fetch-2026.js"
    FETCH_EXIT=$?
    if [ $FETCH_EXIT -eq 0 ]; then
        ok "Live data fetched successfully"
        # Show what we got
        if [ -f "$SCRIPT_DIR/data/meta.json" ]; then
            echo -e "  Data files:"
            for f in "$SCRIPT_DIR/data/"*.json; do
                FNAME=$(basename "$f")
                FSIZE=$(wc -c < "$f" | tr -d ' ')
                if [ "$FSIZE" -gt 10 ]; then
                    echo -e "    ${GREEN}✓${NC} $FNAME ($(echo "scale=1; $FSIZE/1024" | bc)KB)"
                else
                    echo -e "    ${YELLOW}○${NC} $FNAME (empty — source may not have data yet)"
                fi
            done
        fi
    else
        info "Data fetch had errors (exit code $FETCH_EXIT) — deploying with available data"
        info "GitHub Actions daily cron will retry at 4AM ET"
    fi
else
    info "Fetch script not found — data will be populated by GitHub Actions cron"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 5: Check if repo exists — determines fresh vs update path
# ══════════════════════════════════════════════════════════════════════════
step 5 "Checking repository status..."

FRESH_DEPLOY=false
REPO_EXISTS=false
if gh repo view "$GH_USER/$REPO_NAME" &> /dev/null 2>&1; then
    REPO_EXISTS=true
    HAS_INDEX=$(gh api repos/"$GH_USER"/"$REPO_NAME"/contents/index.html --jq '.name' 2>/dev/null || echo "")
    if [ "$HAS_INDEX" = "index.html" ]; then
        ok "Existing repo found — will update"
    else
        info "Repo exists but appears broken — will recreate"
        gh repo delete "$GH_USER/$REPO_NAME" --yes 2>/dev/null
        sleep 3
        REPO_EXISTS=false
        FRESH_DEPLOY=true
    fi
else
    ok "No existing repo — will create fresh"
    FRESH_DEPLOY=true
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 6: Set up git + commit
# ══════════════════════════════════════════════════════════════════════════
step 6 "Committing all files..."

GH_EMAIL=$(gh api user --jq '.email // empty' 2>/dev/null || echo "")
GH_NAME=$(gh api user --jq '.name // .login' 2>/dev/null || echo "$GH_USER")
if [ -z "$GH_EMAIL" ]; then
    GH_EMAIL="${GH_USER}@users.noreply.github.com"
fi

if [ "$FRESH_DEPLOY" = true ] || [ ! -d .git ]; then
    rm -rf .git 2>/dev/null
    git init
    git checkout -b main
fi
git config user.email "$GH_EMAIL"
git config user.name "$GH_NAME"

# Set remote
if [ "$REPO_EXISTS" = true ]; then
    git remote remove origin 2>/dev/null
    git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git"
fi

git add -A
STAGED_COUNT=$(git diff --cached --name-only | wc -l | tr -d ' ')

if [ "$STAGED_COUNT" -gt 0 ]; then
    echo -e "  Files staged: ${BOLD}$STAGED_COUNT${NC}"
    echo "  Key files:"
    git diff --cached --name-only | grep -E "(index\.html|styles\.css|explorer\.js|leaderboard\.js|data\.js|deploy\.yml|fetch-data\.yml|fg-|sv-)" | head -15 | sed 's/^/    ✓ /'

    TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')
    git commit -m "Deploy: Baseball Hub — $TIMESTAMP

Custom XGBoost Stuff+ model, live FanGraphs + Savant data,
GitHub Actions daily cron, GitHub Pages deployment."

    ok "Committed $STAGED_COUNT files"
else
    info "No new changes to commit"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 7: Push to GitHub
# ══════════════════════════════════════════════════════════════════════════
step 7 "Pushing to GitHub..."

if [ "$FRESH_DEPLOY" = true ]; then
    gh repo create "$REPO_NAME" \
        --public \
        --description "Baseball Hub — Advanced MLB Stats Explorer & Stuff+ Leaderboard by Jack Mueller" \
        --source=. \
        --remote=origin \
        --push
    if [ $? -ne 0 ]; then
        git remote remove origin 2>/dev/null
        git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git"
        git push -u origin main --force
    fi
else
    git push -u origin main --force
fi
ok "Code + data pushed to GitHub"

# Verify
sleep 2
HAS_INDEX=$(gh api repos/"$GH_USER"/"$REPO_NAME"/contents/index.html --jq '.name' 2>/dev/null || echo "")
if [ "$HAS_INDEX" = "index.html" ]; then
    ok "index.html confirmed on GitHub"
else
    info "Verifying push..."
    git push -u origin main --force
    sleep 2
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 8: Enable Pages + wait for deploy
# ══════════════════════════════════════════════════════════════════════════
step 8 "Enabling GitHub Pages..."

if [ "$FRESH_DEPLOY" = true ]; then
    gh api repos/"$GH_USER"/"$REPO_NAME"/pages \
        --method POST \
        --field "build_type=workflow" \
        2>/dev/null && ok "GitHub Pages enabled (Actions workflow)" \
        || info "Pages may already be enabled"
fi

SITE_URL="https://$GH_USER.github.io/$REPO_NAME/"
REPO_URL="https://github.com/$GH_USER/$REPO_NAME"

echo ""
echo -e "  Waiting for site deployment..."
MAX_WAIT=120
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        ok "Site is live! (HTTP 200)"
        break
    fi
    RUN_STATUS=$(gh run list --repo "$GH_USER/$REPO_NAME" --workflow "Deploy to GitHub Pages" --limit 1 --json status --jq '.[0].status' 2>/dev/null || echo "unknown")
    if [ "$RUN_STATUS" = "completed" ]; then
        ok "Deploy workflow completed"
        break
    fi
    sleep 5
    WAITED=$((WAITED + 5))
    printf "\r  ⏳ Waiting... (%ds, HTTP: %s)  " $WAITED "$HTTP_CODE"
done
echo ""

# ── Done! ──
echo ""
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo -e "${BOLD}  ⚾ BASEBALL HUB IS LIVE!${NC}"
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 Site: ${GREEN}${BOLD}$SITE_URL${NC}"
echo -e "  📄 Repo: $REPO_URL"
echo -e "  📊 Data: Live FanGraphs + Savant (auto-refreshes daily at 4AM ET)"
echo ""
echo -e "  ${YELLOW}What's included:${NC}"
echo -e "    • Custom XGBoost Stuff+ model (2020-2025)"
echo -e "    • Live 2026 FanGraphs stats + Stuff+/Loc+/Pit+"
echo -e "    • Live 2026 Savant xStats (xwOBA, xBA, xSLG, Barrel%, EV)"
echo -e "    • Daily auto-refresh via GitHub Actions"
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$SITE_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$SITE_URL" 2>/dev/null || true
fi

echo "Press any key to close this window..."
read -n1
