# Release and Version Notes

## Multi-Architecture Images

The deploy-version workflow publishes images for `linux/amd64`, `linux/arm64`, and `linux/arm/v7`. `tools/release-app.sh` uses `DOCKER_PUSH_BY_PLATFORM=1` to publish platform-specific tags and caches; `tools/publish-all-manifests.sh` merges them into the canonical tag. Separate cache refs prevent concurrent builds from clobbering each other.

## Docker Package Manifest

Release tooling writes an ignored temporary `package.docker.json` with version-related fields removed. Dockerfiles use it instead of `package.json` so version-only edits retain the dependency-install cache; the release script removes the generated file after it exits.

## Versions

Jenkins writes the release version to `package.json.version` and the optional
`VERSION_TAG` parameter to `package.json.iksir.childrenVersionTag`. Leaving the
parameter empty clears any previous suffix. Docker tags use the version alone
for an empty, missing, `null`, `stable`, or `latest` suffix (for example `5.0.0`);
other suffixes are appended with one separator (for example `5.0.0-beta`).
Both image builds and manifest publication use `tools/project-info.sh`.

`tools/update-versions.sh` updates `UBS_PLATFORM_VERSION` and `ENGINE5_VERSION`; `POSTRAL_CORE_VERSION` does not apply because this is the Postral source repository. Compose configuration uses environment-default image tags. Update exact package names collected from package manifests rather than every dependency under a shared npm scope.
