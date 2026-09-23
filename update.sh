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
INSTALL_DIR="${HOME}/.local/bin/tetakent/postral"
STOCK_ENV_URL="${RAW_BASE_URL}/infrastructure/stock.env"
ENV_FILE="${INSTALL_DIR}/.env"
# ──────────────────────────────────────────────────────────────────────────────

set_macos_apple_silicon_mongo_version() {
  if [[ "$(uname -s)" != "Darwin" ]]; then
    return
  fi

  local machine_arch
  machine_arch="$(uname -m)"
  if [[ "${machine_arch}" != "arm64" && "$(sysctl -in sysctl.proc_translated 2>/dev/null || true)" != "1" ]]; then
    return
  fi

  local temp_file
  temp_file="$(mktemp)"
  awk '
    /^MONGO_VERSION=/ {
      print "MONGO_VERSION=7.0.43-jammy"
      updated = 1
      next
    }
    { print }
    END {
      if (!updated) print "MONGO_VERSION=7.0.43-jammy"
    }
  ' "${ENV_FILE}" > "${temp_file}"
  mv "${temp_file}" "${ENV_FILE}"
}

if [ ! -d "${INSTALL_DIR}" ]; then
  echo "ERROR: Install directory not found: ${INSTALL_DIR}"
  echo "Run the installer first:"
  echo "  curl -fsSL ${RAW_BASE_URL}/install.sh | bash"
  exit 1
fi

echo "Updating versions in: ${ENV_FILE}"
curl -fsSL "${STOCK_ENV_URL}" -o "${ENV_FILE}"
set_macos_apple_silicon_mongo_version
echo "Done! Updated .env with latest versions from stock.env"
echo ""
echo "To apply the new versions, restart the stack:"
echo "  cd \"${INSTALL_DIR}\""
echo "  docker compose pull"
echo "  docker compose up -d"
