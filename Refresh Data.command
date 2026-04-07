#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Baseball Hub — Refresh Live Data
# ═══════════════════════════════════════════════════════════════════════════
#
# DOUBLE-CLICK to fetch fresh data from FanGraphs + Savant and push to GitHub.
# This updates the live site without a full redeploy.
# ═══════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

REPO_NAME="baseball-hub"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}⚾ Baseball Hub — Data Refresh${NC}"
echo "════════════════════════════════════════"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install it: https://nodejs.org${NC}"
    echo "Press any key to close..."; read -n1; exit 1
fi

# Fetch data
echo -e "${BLUE}[1/3]${NC} ${BOLD}Fetching live data...${NC}"
node "$SCRIPT_DIR/scripts/fetch-2026.js"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Data fetch failed${NC}"
    echo "Press any key to close..."; read -n1; exit 1
fi

# Commit and push
echo ""
echo -e "${BLUE}[2/3]${NC} ${BOLD}Pushing to GitHub...${NC}"

if [ ! -d .git ]; then
    echo -e "${RED}❌ No git repo found. Run the Deploy script first.${NC}"
    echo "Press any key to close..."; read -n1; exit 1
fi

git add data/
if git diff --cached --quiet; then
    echo -e "  ${YELLOW}ℹ️  No data changes detected${NC}"
else
    TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')
    git commit -m "Data refresh — $TIMESTAMP

Auto-fetched from FanGraphs API + Baseball Savant."
    git push origin main
    echo -e "  ${GREEN}✅ Data pushed — site will update in ~60 seconds${NC}"
fi

echo ""
echo -e "${BLUE}[3/3]${NC} ${BOLD}Done!${NC}"
echo ""
echo -e "  ${GREEN}✅ Data refreshed successfully${NC}"
echo ""
echo "Press any key to close..."
read -n1
