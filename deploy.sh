#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Baseball Hub — One-Click Deployment
# ═══════════════════════════════════════════════════════════════════════════
#
# USAGE:  Double-click this file, or run in Terminal:
#         cd baseball-hub && ./deploy.sh
#
# This script handles EVERYTHING automatically:
#   1. Installs GitHub CLI (if missing)
#   2. Authenticates with GitHub (if needed)
#   3. Initializes git repo
#   4. Commits all project files
#   5. Creates a public GitHub repository
#   6. Pushes code to main branch
#   7. Enables GitHub Pages via Actions
#   8. Waits for deployment to finish
#   9. Opens your live site in the browser
# ═══════════════════════════════════════════════════════════════════════════

set -e

REPO_NAME="baseball-hub"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

step() { echo -e "\n${BLUE}[$1/8]${NC} ${BOLD}$2${NC}"; }
ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
info() { echo -e "  ${YELLOW}ℹ️  $1${NC}"; }
fail() { echo -e "  ${RED}❌ $1${NC}"; exit 1; }

echo ""
echo -e "${BOLD}⚾ Baseball Hub — One-Click Deploy${NC}"
echo "════════════════════════════════════════"

# ══════════════════════════════════════════════════════════════════════════
# STEP 1: Install GitHub CLI
# ══════════════════════════════════════════════════════════════════════════
step 1 "Checking GitHub CLI..."

if command -v gh &> /dev/null; then
    ok "GitHub CLI found ($(gh --version | head -1))"
else
    info "GitHub CLI not found — installing now..."

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install gh
        else
            info "Homebrew not found — installing Homebrew first..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            # Add brew to PATH for Apple Silicon
            if [[ -f /opt/homebrew/bin/brew ]]; then
                eval "$(/opt/homebrew/bin/brew shellenv)"
            fi
            brew install gh
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
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
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        # Windows (Git Bash / MSYS2)
        if command -v winget &> /dev/null; then
            winget install --id GitHub.cli
        elif command -v choco &> /dev/null; then
            choco install gh -y
        else
            fail "Install gh manually: https://cli.github.com"
        fi
    else
        fail "Unsupported OS ($OSTYPE). Install gh manually: https://cli.github.com"
    fi

    # Verify installation
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
# STEP 3: Initialize git repository
# ══════════════════════════════════════════════════════════════════════════
step 3 "Initializing git repository..."

if [ -d .git ]; then
    # Make sure we're on main
    CURRENT=$(git branch --show-current 2>/dev/null || echo "")
    if [ "$CURRENT" != "main" ]; then
        git checkout -b main 2>/dev/null || git checkout main
    fi
    ok "Git repo exists (branch: main)"
else
    git init
    git checkout -b main
    ok "Git repo initialized"
fi

# Configure git user if not set (needed for commit)
if [ -z "$(git config user.email)" ]; then
    GH_EMAIL=$(gh api user --jq '.email // empty' 2>/dev/null || echo "")
    GH_NAME=$(gh api user --jq '.name // .login' 2>/dev/null || echo "$GH_USER")
    if [ -z "$GH_EMAIL" ]; then
        GH_EMAIL="${GH_USER}@users.noreply.github.com"
    fi
    git config user.email "$GH_EMAIL"
    git config user.name "$GH_NAME"
    info "Git user configured: $GH_NAME <$GH_EMAIL>"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 4: Stage and commit files
# ══════════════════════════════════════════════════════════════════════════
step 4 "Committing project files..."

git add -A
if git diff --cached --quiet 2>/dev/null; then
    info "No new changes to commit (already up to date)"
else
    COMMIT_MSG="Deploy: Baseball Hub — Stats Explorer & Stuff+ Leaderboard

Multi-file project structure with live data pipelines:
- FanGraphs API (wRC+, WAR, wOBA, FIP, K%, BB%, SwStr%)
- Baseball Savant (xwOBA, xBA, xSLG, Barrel%, Avg EV, Whiff%)
- MLB Stats API (player lookups, season stats)
- Custom XGBoost Stuff+ model (100-centered scale)

GitHub Pages auto-deployment via Actions."

    git commit -m "$COMMIT_MSG"
    ok "All files committed"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 5: Create GitHub repository
# ══════════════════════════════════════════════════════════════════════════
step 5 "Creating GitHub repository..."

if gh repo view "$GH_USER/$REPO_NAME" &> /dev/null 2>&1; then
    info "Repository $GH_USER/$REPO_NAME already exists"
    # Make sure remote is set
    if ! git remote get-url origin &> /dev/null 2>&1; then
        git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git"
    fi
else
    gh repo create "$REPO_NAME" \
        --public \
        --description "Baseball Hub — Advanced MLB Stats Explorer & Stuff+ Leaderboard by Jack Mueller" \
        --source=. \
        --push
    ok "Repository created: github.com/$GH_USER/$REPO_NAME"
fi

# ══════════════════════════════════════════════════════════════════════════
# STEP 6: Push to GitHub
# ══════════════════════════════════════════════════════════════════════════
step 6 "Pushing code to GitHub..."

git push -u origin main 2>&1 || git push origin main 2>&1
ok "Code pushed to main branch"

# ══════════════════════════════════════════════════════════════════════════
# STEP 7: Enable GitHub Pages
# ══════════════════════════════════════════════════════════════════════════
step 7 "Enabling GitHub Pages..."

# Enable Pages with Actions as the build source
gh api repos/"$GH_USER"/"$REPO_NAME"/pages \
    --method POST \
    --field "build_type=workflow" \
    2>/dev/null && ok "GitHub Pages enabled" \
    || info "Pages already enabled"

# ══════════════════════════════════════════════════════════════════════════
# STEP 8: Wait for deployment and open site
# ══════════════════════════════════════════════════════════════════════════
step 8 "Waiting for deployment to go live..."

SITE_URL="https://$GH_USER.github.io/$REPO_NAME/"
REPO_URL="https://github.com/$GH_USER/$REPO_NAME"
MAX_WAIT=120
WAITED=0

echo -e "  ⏳ Checking deployment status (up to ${MAX_WAIT}s)..."

while [ $WAITED -lt $MAX_WAIT ]; do
    # Check if the Actions workflow has completed
    RUN_STATUS=$(gh run list --repo "$GH_USER/$REPO_NAME" --limit 1 --json status --jq '.[0].status' 2>/dev/null || echo "unknown")

    if [ "$RUN_STATUS" = "completed" ]; then
        CONCLUSION=$(gh run list --repo "$GH_USER/$REPO_NAME" --limit 1 --json conclusion --jq '.[0].conclusion' 2>/dev/null || echo "unknown")
        if [ "$CONCLUSION" = "success" ]; then
            ok "Deployment successful!"
            break
        else
            info "Deployment finished with status: $CONCLUSION"
            break
        fi
    fi

    sleep 5
    WAITED=$((WAITED + 5))
    printf "  ⏳ Waiting... (%ds)\r" $WAITED
done

if [ $WAITED -ge $MAX_WAIT ]; then
    info "Deployment still in progress — it will finish shortly."
    info "Check status: gh run list --repo $GH_USER/$REPO_NAME"
fi

# ── Open in browser ──
echo ""
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo -e "${BOLD}⚾ BASEBALL HUB IS LIVE!${NC}"
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 ${GREEN}${BOLD}$SITE_URL${NC}"
echo -e "  📄 $REPO_URL"
echo ""

# Auto-open in default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$SITE_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$SITE_URL" 2>/dev/null || echo "  Open the URL above in your browser."
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    start "$SITE_URL" 2>/dev/null || echo "  Open the URL above in your browser."
fi

echo -e "  ${YELLOW}Future updates:${NC} edit files, then run ./deploy.sh again"
echo ""
