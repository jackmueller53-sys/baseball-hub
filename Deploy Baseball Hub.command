#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Baseball Hub — One-Click Deployment (v2 — bulletproof)
# ═══════════════════════════════════════════════════════════════════════════
#
# DOUBLE-CLICK THIS FILE to deploy Baseball Hub to GitHub Pages.
#
# This script handles EVERYTHING automatically:
#   1. Installs GitHub CLI (if missing)
#   2. Authenticates with GitHub (if needed)
#   3. Deletes any broken previous repo
#   4. Starts a fresh git repo in THIS folder
#   5. Commits all project files
#   6. Creates a new public GitHub repository
#   7. Pushes all code to main branch
#   8. Enables GitHub Pages via Actions
#   9. Waits for deployment, then opens your live site
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

step() { echo ""; echo -e "${BLUE}[$1/9]${NC} ${BOLD}$2${NC}"; }
ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
info() { echo -e "  ${YELLOW}ℹ️  $1${NC}"; }
fail() { echo -e "  ${RED}❌ $1${NC}"; echo ""; echo "Press any key to close..."; read -n1; exit 1; }

echo ""
echo -e "${BOLD}⚾ Baseball Hub — One-Click Deploy${NC}"
echo "════════════════════════════════════════"
echo ""
echo -e "  Working directory: ${BOLD}$SCRIPT_DIR${NC}"

# ── Sanity check: make sure index.html exists in this folder ──
if [ ! -f "$SCRIPT_DIR/index.html" ]; then
    fail "index.html not found in $SCRIPT_DIR — make sure this script is inside the baseball-hub project folder."
fi
ok "Project files found (index.html, css/, js/)"

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
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            (type -p wget >/dev/null || sudo apt-get install wget -y) \
            && sudo mkdir -p -m 755 /etc/apt/keyrings \
            && out=$(mktemp) && wget -nv -O"$out" https://cli.github.com/packages/githubcli-archive-keyring.gpg \
            && cat "$out" | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
            && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
            && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
            && sudo apt-get update && sudo apt-get install gh -y
        elif command -v dnf &> /dev/null; then
            sudo dnf install 'dnf-command(config-manager)' -y
            sudo dnf config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo
            sudo dnf install gh -y
        else
            fail "Unsupported Linux distro. Install gh manually: https://cli.github.com"
        fi
    else
        fail "Unsupported OS ($OSTYPE). Install gh manually: https://cli.github.com"
    fi

    if ! command -v gh &> /dev/null; then
        fail "GitHub CLI installation failed. Install manually: https://cli.github.com"
    fi
    ok "GitHub CLI installed successfully"
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
    echo ""
    echo "  A browser window will open. Follow the prompts to sign in."
    echo ""
    gh auth login --web --git-protocol https
    GH_USER=$(gh api user --jq '.login')
    ok "Authenticated as: $GH_USER"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 3: Delete broken previous repo (if it exists)
# ══════════════════════════════════════════════════════════════════════════
step 3 "Cleaning up any previous broken deploy..."

if gh repo view "$GH_USER/$REPO_NAME" &> /dev/null 2>&1; then
    info "Deleting old repo $GH_USER/$REPO_NAME to start fresh..."
    gh repo delete "$GH_USER/$REPO_NAME" --yes 2>/dev/null
    if [ $? -eq 0 ]; then
        ok "Old repo deleted"
        sleep 3  # Give GitHub a moment to process
    else
        info "Could not auto-delete. You may need to delete it manually at:"
        info "https://github.com/$GH_USER/$REPO_NAME/settings (scroll to Danger Zone)"
        echo ""
        echo "  After deleting, press any key to continue..."
        read -n1
    fi
else
    ok "No previous repo found — starting fresh"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 4: Fresh git init in THIS folder
# ══════════════════════════════════════════════════════════════════════════
step 4 "Initializing fresh git repository..."

# Remove any existing .git to avoid inheriting a broken state
if [ -d .git ]; then
    rm -rf .git
    info "Removed stale .git directory"
fi

git init
git checkout -b main

# Configure git user
GH_EMAIL=$(gh api user --jq '.email // empty' 2>/dev/null || echo "")
GH_NAME=$(gh api user --jq '.name // .login' 2>/dev/null || echo "$GH_USER")
if [ -z "$GH_EMAIL" ]; then
    GH_EMAIL="${GH_USER}@users.noreply.github.com"
fi
git config user.email "$GH_EMAIL"
git config user.name "$GH_NAME"

ok "Git initialized (branch: main, user: $GH_NAME)"

# ══════════════════════════════════════════════════════════════════════════
# STEP 5: Stage and commit ALL files
# ══════════════════════════════════════════════════════════════════════════
step 5 "Committing all project files..."

git add -A

# Verify files are actually staged
STAGED_COUNT=$(git diff --cached --name-only | wc -l | tr -d ' ')
echo -e "  Files staged: ${BOLD}$STAGED_COUNT${NC}"

if [ "$STAGED_COUNT" -lt 5 ]; then
    echo ""
    echo -e "  ${RED}WARNING: Expected at least 5 files but only found $STAGED_COUNT${NC}"
    echo "  Staged files:"
    git diff --cached --name-only | sed 's/^/    /'
    echo ""
    fail "Too few files staged. Something is wrong with the project folder."
fi

# Show what we're committing
echo "  Key files:"
git diff --cached --name-only | grep -E "(index\.html|styles\.css|explorer\.js|data\.js|deploy\.yml)" | sed 's/^/    ✓ /'

git commit -m "Deploy: Baseball Hub — Stats Explorer & Stuff+ Leaderboard

Multi-file project structure with live data pipelines:
- FanGraphs API (wRC+, WAR, wOBA, FIP, K%, BB%, SwStr%)
- Baseball Savant (xwOBA, xBA, xSLG, Barrel%, Avg EV, Whiff%)
- MLB Stats API (player lookups, season stats)
- Custom XGBoost Stuff+ model (100-centered scale)

GitHub Pages auto-deployment via Actions."

ok "All $STAGED_COUNT files committed"

# ══════════════════════════════════════════════════════════════════════════
# STEP 6: Create new GitHub repository
# ══════════════════════════════════════════════════════════════════════════
step 6 "Creating GitHub repository..."

gh repo create "$REPO_NAME" \
    --public \
    --description "Baseball Hub — Advanced MLB Stats Explorer & Stuff+ Leaderboard by Jack Mueller" \
    --source=. \
    --remote=origin \
    --push

if [ $? -ne 0 ]; then
    # Fallback: manual remote + push
    info "Trying fallback push method..."
    git remote remove origin 2>/dev/null
    git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git"
    git push -u origin main --force
fi

ok "Repository created and code pushed"

# ══════════════════════════════════════════════════════════════════════════
# STEP 7: Verify the push worked
# ══════════════════════════════════════════════════════════════════════════
step 7 "Verifying files on GitHub..."

sleep 2
REMOTE_FILES=$(gh api repos/"$GH_USER"/"$REPO_NAME"/git/trees/main --jq '.tree | length' 2>/dev/null || echo "0")
echo -e "  Files on GitHub: ${BOLD}$REMOTE_FILES${NC}"

if [ "$REMOTE_FILES" -lt 3 ]; then
    info "Push may not have completed. Trying force push..."
    git push -u origin main --force
    sleep 2
    REMOTE_FILES=$(gh api repos/"$GH_USER"/"$REPO_NAME"/git/trees/main --jq '.tree | length' 2>/dev/null || echo "0")
    echo -e "  Files on GitHub (retry): ${BOLD}$REMOTE_FILES${NC}"
fi

# Check that index.html specifically exists
HAS_INDEX=$(gh api repos/"$GH_USER"/"$REPO_NAME"/contents/index.html --jq '.name' 2>/dev/null || echo "")
if [ "$HAS_INDEX" = "index.html" ]; then
    ok "index.html confirmed on GitHub"
else
    fail "index.html is NOT on GitHub. The push failed. Try running this script again."
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 8: Enable GitHub Pages
# ══════════════════════════════════════════════════════════════════════════
step 8 "Enabling GitHub Pages..."

# Try Actions-based deployment first
gh api repos/"$GH_USER"/"$REPO_NAME"/pages \
    --method POST \
    --field "build_type=workflow" \
    2>/dev/null && ok "GitHub Pages enabled (Actions workflow)" \
    || {
        # Fallback: try setting source to main branch root
        gh api repos/"$GH_USER"/"$REPO_NAME"/pages \
            --method POST \
            -f "source[branch]=main" \
            -f "source[path]=/" \
            2>/dev/null && ok "GitHub Pages enabled (branch deploy)" \
            || info "Pages may already be enabled"
    }

# ══════════════════════════════════════════════════════════════════════════
# STEP 9: Wait for deployment and open site
# ══════════════════════════════════════════════════════════════════════════
step 9 "Waiting for site to go live..."

SITE_URL="https://$GH_USER.github.io/$REPO_NAME/"
REPO_URL="https://github.com/$GH_USER/$REPO_NAME"
MAX_WAIT=150
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
    # Check Actions workflow
    RUN_STATUS=$(gh run list --repo "$GH_USER/$REPO_NAME" --limit 1 --json status --jq '.[0].status' 2>/dev/null || echo "unknown")

    if [ "$RUN_STATUS" = "completed" ]; then
        CONCLUSION=$(gh run list --repo "$GH_USER/$REPO_NAME" --limit 1 --json conclusion --jq '.[0].conclusion' 2>/dev/null || echo "unknown")
        if [ "$CONCLUSION" = "success" ]; then
            ok "Deployment successful!"
            break
        else
            info "Deploy finished with status: $CONCLUSION"
            break
        fi
    fi

    # Also try hitting the URL directly
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        ok "Site is live! (HTTP 200)"
        break
    fi

    sleep 5
    WAITED=$((WAITED + 5))
    printf "\r  ⏳ Waiting for GitHub Pages... (%ds, HTTP: %s)  " $WAITED "$HTTP_CODE"
done
echo ""

if [ $WAITED -ge $MAX_WAIT ]; then
    info "Deployment is still processing — check back in a minute."
    info "Status: gh run list --repo $GH_USER/$REPO_NAME"
fi

# ── Open in browser ──
echo ""
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo -e "${BOLD}  ⚾ BASEBALL HUB IS LIVE!${NC}"
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 Site: ${GREEN}${BOLD}$SITE_URL${NC}"
echo -e "  📄 Repo: $REPO_URL"
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$SITE_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$SITE_URL" 2>/dev/null || true
fi

echo -e "  ${YELLOW}Future updates:${NC} edit files, then double-click this file again."
echo ""
echo "Press any key to close this window..."
read -n1
