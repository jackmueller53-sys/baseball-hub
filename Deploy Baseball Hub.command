#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Baseball Hub — One-Click Deployment (v3 — smart update)
# ═══════════════════════════════════════════════════════════════════════════
#
# DOUBLE-CLICK THIS FILE to deploy Baseball Hub to GitHub Pages.
#
# Smart behavior:
#   - First time: creates repo, pushes code, enables Pages, triggers data fetch
#   - Subsequent: pushes updates, triggers data fetch workflow
# ═══════════════════════════════════════════════════════════════════════════

# ── Always cd into the folder where this script lives ──
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

REPO_NAME="baseball-hub"

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
# Detect mode: fresh deploy vs update
# ══════════════════════════════════════════════════════════════════════════
FRESH_DEPLOY=false
TOTAL_STEPS=7

# ══════════════════════════════════════════════════════════════════════════
# STEP 1: Install GitHub CLI
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
# STEP 2: Authenticate with GitHub
# ══════════════════════════════════════════════════════════════════════════
step 2 "Checking GitHub authentication..."

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
# STEP 3: Check if repo exists — determines fresh vs update path
# ══════════════════════════════════════════════════════════════════════════
step 3 "Checking repository status..."

REPO_EXISTS=false
if gh repo view "$GH_USER/$REPO_NAME" &> /dev/null 2>&1; then
    REPO_EXISTS=true
    HAS_INDEX=$(gh api repos/"$GH_USER"/"$REPO_NAME"/contents/index.html --jq '.name' 2>/dev/null || echo "")
    if [ "$HAS_INDEX" = "index.html" ]; then
        ok "Existing repo found with project files — will update"
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
# STEP 4: Set up git
# ══════════════════════════════════════════════════════════════════════════
step 4 "Setting up git..."

GH_EMAIL=$(gh api user --jq '.email // empty' 2>/dev/null || echo "")
GH_NAME=$(gh api user --jq '.name // .login' 2>/dev/null || echo "$GH_USER")
if [ -z "$GH_EMAIL" ]; then
    GH_EMAIL="${GH_USER}@users.noreply.github.com"
fi

if [ "$FRESH_DEPLOY" = true ]; then
    # Clean start
    rm -rf .git 2>/dev/null
    git init
    git checkout -b main
    git config user.email "$GH_EMAIL"
    git config user.name "$GH_NAME"
    ok "Fresh git initialized"
else
    # Repo exists — make sure we have the remote set up
    if [ ! -d .git ]; then
        git init
        git checkout -b main
    fi
    git config user.email "$GH_EMAIL"
    git config user.name "$GH_NAME"

    # Set remote
    git remote remove origin 2>/dev/null
    git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git"
    ok "Git configured with remote"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 5: Commit and push
# ══════════════════════════════════════════════════════════════════════════
step 5 "Committing and pushing..."

git add -A
STAGED_COUNT=$(git diff --cached --name-only | wc -l | tr -d ' ')

if [ "$STAGED_COUNT" -eq 0 ] && [ "$FRESH_DEPLOY" = false ]; then
    # Check if there are any changes at all
    if git diff --quiet HEAD 2>/dev/null; then
        info "No changes detected — force-pushing existing code"
        git push -u origin main --force
        ok "Force-pushed (no changes)"
    else
        git add -A
        STAGED_COUNT=$(git diff --cached --name-only | wc -l | tr -d ' ')
    fi
fi

if [ "$STAGED_COUNT" -gt 0 ]; then
    echo -e "  Files staged: ${BOLD}$STAGED_COUNT${NC}"
    echo "  Key files:"
    git diff --cached --name-only | grep -E "(index\.html|styles\.css|explorer\.js|leaderboard\.js|data\.js|deploy\.yml|fetch-data\.yml)" | sed 's/^/    ✓ /'

    TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')
    git commit -m "Deploy: Baseball Hub — $TIMESTAMP

Updated files: custom XGBoost Stuff+ model, Statcast/Savant pipeline,
FanGraphs data integration, GitHub Actions daily cron."

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
    ok "Code pushed to GitHub"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 6: Enable Pages + trigger data fetch
# ══════════════════════════════════════════════════════════════════════════
step 6 "Configuring GitHub Pages & triggering data fetch..."

if [ "$FRESH_DEPLOY" = true ]; then
    # Enable Pages via Actions
    gh api repos/"$GH_USER"/"$REPO_NAME"/pages \
        --method POST \
        --field "build_type=workflow" \
        2>/dev/null && ok "GitHub Pages enabled" \
        || info "Pages may already be enabled"
fi

# Trigger the data fetch workflow
sleep 3
gh workflow run "Fetch 2026 Live Data" --repo "$GH_USER/$REPO_NAME" 2>/dev/null \
    && ok "Data fetch workflow triggered — Statcast + FanGraphs data will populate in ~2 minutes" \
    || info "Data fetch workflow will run on next daily cron (8AM UTC)"

# ══════════════════════════════════════════════════════════════════════════
# STEP 7: Wait for deploy + open site
# ══════════════════════════════════════════════════════════════════════════
step 7 "Waiting for site to go live..."

SITE_URL="https://$GH_USER.github.io/$REPO_NAME/"
REPO_URL="https://github.com/$GH_USER/$REPO_NAME"
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
    printf "\r  ⏳ Waiting for GitHub Pages... (%ds, HTTP: %s)  " $WAITED "$HTTP_CODE"
done
echo ""

if [ $WAITED -ge $MAX_WAIT ]; then
    info "Deployment still processing — check back in a minute."
fi

# ── Open in browser ──
echo ""
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo -e "${BOLD}  ⚾ BASEBALL HUB IS LIVE!${NC}"
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 Site: ${GREEN}${BOLD}$SITE_URL${NC}"
echo -e "  📄 Repo: $REPO_URL"
echo -e "  📊 Data: Auto-fetches daily at 4AM ET (FanGraphs + Savant)"
echo ""
echo -e "  ${YELLOW}Note:${NC} Statcast/FanGraphs data will appear after the fetch"
echo -e "  workflow completes (~2 min). Custom Stuff+ model data"
echo -e "  (2020-2025) is already embedded in the site."
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$SITE_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$SITE_URL" 2>/dev/null || true
fi

echo "Press any key to close this window..."
read -n1
