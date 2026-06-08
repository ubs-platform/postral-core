#!/usr/bin/env bash
# Postral Core — one-line installer
# Usage: curl -fsSL https://raw.githubusercontent.com/ubs-platform/postral-core/master/install.sh | bash
set -euo pipefail

# ─── Variables ────────────────────────────────────────────────────────────────
REPO_OWNER="ubs-platform"
REPO_NAME="postral-core"
BRANCH="master"
RAW_BASE_URL="https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}"
INSTALL_DIR="${HOME}/.bin/tetakent/postral"

# Files to download (paths relative to repo root)
FILES=(
  "infrastructure/docker-compose.yml"
  "infrastructure/config/postral-ui.conf"
  "infrastructure/init.sql"
)

# Empty directories to create inside the install dir
EMPTY_DIRS=(
  "mongo-data"
  "mariadb-data"
  "mongo-entrypoint"
)
# ──────────────────────────────────────────────────────────────────────────────

# ─── Preflight checks ─────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "ERROR: Docker is not installed or not in PATH."
  echo "Install Docker Engine: https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker info &>/dev/null; then
  echo "ERROR: Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

if ! docker compose version &>/dev/null 2>&1 && ! docker-compose version &>/dev/null 2>&1; then
  echo "WARNING: 'docker compose' plugin not found. You may need to install Docker Compose."
  echo "  https://docs.docker.com/compose/install/"
fi
# ──────────────────────────────────────────────────────────────────────────────

echo "Installing Postral Core to: ${INSTALL_DIR}"
echo ""

# Create install directory structure
mkdir -p "${INSTALL_DIR}/config"

for dir in "${EMPTY_DIRS[@]}"; do
  mkdir -p "${INSTALL_DIR}/${dir}"
done

# Download each file
for file in "${FILES[@]}"; do
  # Strip the "infrastructure/" prefix to get the local relative path
  relative="${file#infrastructure/}"
  target="${INSTALL_DIR}/${relative}"
  target_dir="$(dirname "${target}")"

  mkdir -p "${target_dir}"
  echo "  Downloading ${file} ..."
  curl -fsSL "${RAW_BASE_URL}/${file}" -o "${target}"
done

# Download stock.env as .env (version pins)
echo "  Downloading infrastructure/stock.env -> .env ..."
curl -fsSL "${RAW_BASE_URL}/infrastructure/stock.env" -o "${INSTALL_DIR}/.env"

echo ""
echo "Done! Postral Core installed to: ${INSTALL_DIR}"
echo ""
echo "Next steps:"
echo "  cd \"${INSTALL_DIR}\""
echo "  docker compose up -d"
