#!/usr/bin/env bash
# Postral Core — version updater
# Downloads the latest stock.env from the repo and writes it to .env
# Usage: curl -fsSL https://raw.githubusercontent.com/ubs-platform/postral-core/master/update.sh | bash
set -euo pipefail

# ─── Variables ────────────────────────────────────────────────────────────────
REPO_OWNER="ubs-platform"
REPO_NAME="postral-core"
BRANCH="master"
RAW_BASE_URL="https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}"
INSTALL_DIR="${HOME}/.bin/tetakent/postral"
STOCK_ENV_URL="${RAW_BASE_URL}/infrastructure/stock.env"
ENV_FILE="${INSTALL_DIR}/.env"
# ──────────────────────────────────────────────────────────────────────────────

if [ ! -d "${INSTALL_DIR}" ]; then
  echo "ERROR: Install directory not found: ${INSTALL_DIR}"
  echo "Run the installer first:"
  echo "  curl -fsSL ${RAW_BASE_URL}/install.sh | bash"
  exit 1
fi

echo "Updating versions in: ${ENV_FILE}"
curl -fsSL "${STOCK_ENV_URL}" -o "${ENV_FILE}"
echo "Done! Updated .env with latest versions from stock.env"
echo ""
echo "To apply the new versions, restart the stack:"
echo "  cd \"${INSTALL_DIR}\""
echo "  docker compose pull"
echo "  docker compose up -d"
