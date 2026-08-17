#!/usr/bin/env bash
set -euo pipefail

# Bumps versions coming from the ubs-mona-mr (@ubs-platform) repo and/or the Engine5 docker image,
# across this repo's package.json / docker-compose / stock.env files.
#
# POSTRAL_CORE_VERSION does not apply here: this repo *is* postral-core, so it cannot depend on itself.
#
# Usage:
#   tools/update-versions.sh [--ubs-platform-version=7.2.0] [--engine5-version=0.0.20-alpha]
# Same values can also be provided via env vars: UBS_PLATFORM_VERSION, ENGINE5_VERSION
#
# The docker tag suffix (e.g. "-beta") for @ubs-platform images is derived from the ubs-mona-mr repo's
# package.json ("iksir.childrenVersionTag"), so that sibling repo must be checked out locally.
# Override its location with --ubs-mona-mr-dir= (or UBS_MONA_MR_DIR) if it is not next to this repo.

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$REPO_ROOT"

UBS_PLATFORM_VERSION=${UBS_PLATFORM_VERSION:-}
POSTRAL_CORE_VERSION=${POSTRAL_CORE_VERSION:-}
ENGINE5_VERSION=${ENGINE5_VERSION:-}
UBS_MONA_MR_DIR=${UBS_MONA_MR_DIR:-../users-mona-mr}

for arg in "$@"; do
  case "$arg" in
    --ubs-platform-version=*) UBS_PLATFORM_VERSION="${arg#*=}" ;;
    --postral-core-version=*) POSTRAL_CORE_VERSION="${arg#*=}" ;;
    --engine5-version=*) ENGINE5_VERSION="${arg#*=}" ;;
    --ubs-mona-mr-dir=*) UBS_MONA_MR_DIR="${arg#*=}" ;;
    -h|--help) grep '^#' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $arg" >&2; exit 1 ;;
  esac
done

if [ -n "$POSTRAL_CORE_VERSION" ]; then
  echo "POSTRAL_CORE_VERSION is ignored in this repo (this repo is postral-core itself)." >&2
fi

if [ -z "$UBS_PLATFORM_VERSION" ] && [ -z "$ENGINE5_VERSION" ]; then
  echo "Nothing to do: set at least one of UBS_PLATFORM_VERSION / ENGINE5_VERSION." >&2
  exit 1
fi

# Reads npm scope + docker tag suffix/org/image-prefix from a source repo's root package.json.
# Populates SRC_NPM_PREFIX, SRC_DOCKER_TAG_SUFFIX, SRC_DOCKER_ORG, SRC_DOCKER_IMG_PREFIX, SRC_LIB_NAMES_JSON.
read_source_repo_info() {
  local dir="$1" pkg
  pkg="$dir/package.json"
  [ -f "$pkg" ] || { echo "Cannot find $pkg (checkout the repo or pass the correct --*-dir option)" >&2; exit 1; }
  SRC_NPM_PREFIX=$(jq -r '.iksir.childrenPrefix' "$pkg")
  local tag
  tag=$(jq -r '.iksir.childrenVersionTag // ""' "$pkg")
  if [ "$tag" = "" ] || [ "$tag" = "stable" ] || [ "$tag" = "latest" ]; then
    SRC_DOCKER_TAG_SUFFIX=""
  else
    SRC_DOCKER_TAG_SUFFIX="-$tag"
  fi
  SRC_DOCKER_ORG=$(jq -r '.docker.organisation' "$pkg")
  SRC_DOCKER_IMG_PREFIX=$(jq -r '.docker.imageNamePrefix' "$pkg")
  # Only bump packages actually published from this repo's libs/. Some packages sharing the same
  # npm scope (e.g. @ubs-platform/translator-core) are independent and must not be touched.
  local lib_pkg names=()
  for lib_pkg in "$dir"/libs/*/package.json; do
    [ -f "$lib_pkg" ] || continue
    names+=("$(jq -r '.name' "$lib_pkg")")
  done
  SRC_LIB_NAMES_JSON=$(printf '%s\n' "${names[@]}" | jq -R -s -c 'split("\n") | map(select(length>0))')
}

# Bumps only the known published-library dependencies/devDependencies in a package.json,
# preserving each entry's ^ / ~ range prefix.
update_package_json_deps() {
  local file="$1" names_json="$2" new_version="$3"
  [ -f "$file" ] || return 0
  jq --argjson names "$names_json" --arg v "$new_version" '
    def bump: if startswith("^") then ("^" + $v) elif startswith("~") then ("~" + $v) else $v end;
    def known: (.key as $k | $names | index($k) != null);
    (if .dependencies then .dependencies |= with_entries(if known then .value |= bump else . end) else . end) |
    (if .devDependencies then .devDependencies |= with_entries(if known then .value |= bump else . end) else . end)
  ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  echo "  - $file: known published libs -> $new_version"
}

# Replaces "org/imgPrefix*:tag" docker image tags, handling both hardcoded tags and
# ${VAR-default} style compose defaults, across the given files.
update_docker_image_tag() {
  local new_tag="$1" org="$2" img_prefix="$3"; shift 3
  local f
  for f in "$@"; do
    [ -f "$f" ] || continue
    ORG="$org" IMG_PREFIX="$img_prefix" NEW_TAG="$new_tag" perl -0777 -pi -e '
      my $org = quotemeta($ENV{ORG});
      my $prefix = quotemeta($ENV{IMG_PREFIX});
      my $tag = $ENV{NEW_TAG};
      s/($org\/$prefix[A-Za-z0-9_.-]*:)(\$\{[A-Z0-9_]+-)?[^"'"'"'\s}]+(\})?/$1 . (defined $2 ? $2 : "") . $tag . (defined $3 ? $3 : "")/ge;
    ' "$f"
    echo "  - $f: $org/$img_prefix* -> :$new_tag"
  done
}

# Updates a "VAR=value" assignment in .env-style files, only if the var is already present.
update_env_var() {
  local var="$1" new_value="$2"; shift 2
  local f
  for f in "$@"; do
    [ -f "$f" ] || continue
    if grep -qE "^${var}=" "$f"; then
      sed -i -E "s|^(${var}=).*|\\1${new_value}|" "$f"
      echo "  - $f: $var=$new_value"
    fi
  done
}

DOCKER_COMPOSE_FILES=(infrastructure/docker-compose.yml)
ENV_FILES=(infrastructure/stock.env)

if [ -n "$UBS_PLATFORM_VERSION" ]; then
  echo "Updating @ubs-platform / ubs-mona-* to $UBS_PLATFORM_VERSION"
  read_source_repo_info "$UBS_MONA_MR_DIR"
  update_package_json_deps package.json "$SRC_LIB_NAMES_JSON" "$UBS_PLATFORM_VERSION"
  DOCKER_TAG="${UBS_PLATFORM_VERSION}${SRC_DOCKER_TAG_SUFFIX}"
  update_docker_image_tag "$DOCKER_TAG" "$SRC_DOCKER_ORG" "$SRC_DOCKER_IMG_PREFIX" "${DOCKER_COMPOSE_FILES[@]}"
  update_env_var UBS_VERSION "$DOCKER_TAG" "${ENV_FILES[@]}"
fi

if [ -n "$ENGINE5_VERSION" ]; then
  echo "Updating Engine5 to $ENGINE5_VERSION"
  update_docker_image_tag "$ENGINE5_VERSION" hcangunduz engine5 "${DOCKER_COMPOSE_FILES[@]}"
  update_env_var ENGINE5_VERSION "$ENGINE5_VERSION" "${ENV_FILES[@]}"
fi

echo "Done."
