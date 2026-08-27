# Embedino public launch checklist

This is the launch contract for the desktop app and the `embedino` CLI.

## Channels

- Stable releases use a `vX.Y.Z` tag, a GitHub release marked latest, and npm dist-tag `latest`.
- Nightly releases are generated from `main`, use a prerelease tag, GitHub prerelease status, and npm dist-tag `nightly`.
- Nightly is for testers; stable is the public default.

## Required GitHub checks

Every pull request and protected branch should pass:

- formatting and lint checks
- strict TypeScript typecheck
- unit and integration tests
- generated brand asset check
- release plumbing smoke test
- production web/server/desktop build

The repository workflow is `.github/workflows/ci.yml`. The release workflow additionally builds and publishes the supported platform artifacts.

## Supported desktop artifacts

- macOS arm64 and x64 DMG
- Linux x64 AppImage
- Windows x64 NSIS installer

Windows arm64 remains disabled until a dedicated runner and native dependency validation are available.

## CLI

The npm package is `embedino` and exposes the `embedino` binary:

```bash
npm install --global embedino
embedino --help
npx --yes embedino --help
```

The release workflow publishes stable CLI packages as `latest` and nightly CLI packages as `nightly`.

## Human sign-off before announcing stable

- install and launch the signed artifact on each supported OS
- upgrade from the previous stable release
- start a new chat and resume an existing chat
- exercise provider/model selection and failure recovery
- connect a board and run a build/flash or toolchain workflow where available
- verify light and dark themes, sidebar resizing, menus, and settings
- verify the release notes, download links, and rollback path
