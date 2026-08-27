<div align="center">
  <br />
  <img src="https://raw.githubusercontent.com/embedino/embedino/f5ef203ffdd8c615b2cb552da1f54628052c8c47/logo.svg" alt="Embedino Logo" width="100" height="100" />
  <br />
  <br />
  <h1>Embedino Workspace</h1>
  <p><b>Build, debug, and ship hardware with AI.</b></p>
  <p>An open-source, local-first developer workspace for embedded systems and everything around them.</p>
  <br />

  <a href="https://embedino.app"><strong>Website</strong></a> &nbsp;&bull;&nbsp;
  <a href="#overview"><strong>Overview</strong></a> &nbsp;&bull;&nbsp;
  <a href="#core-pillars"><strong>Pillars</strong></a> &nbsp;&bull;&nbsp;
  <a href="#getting-started"><strong>Getting Started</strong></a>
  
  <br />
  <br />
</div>

---

## Overview

**Embedino** is a unified developer workspace for hardware and software workflows. It connects AI-assisted coding with projects, terminals, toolchains, boards, previews, and source control without forcing developers into a separate hardware-only mode.

Embedino is local-first and provider-agnostic: use the AI provider, model, board, and toolchain that fit the project.

---

## Core Pillars

- **Minimal Complexity** — Streamlined developer experience designed to get out of your way and let you build.
- **Maximum Potential** — Extensible architecture engineered to handle everything from microcontrollers to intelligent edge nodes.
- **Built in the Open** — Open-source foundation prioritizing transparency, community feedback, and modular extension.

---

## Install the CLI

The public CLI package is `embedino`:

```bash
npm install --global embedino
embedino --help
```

For a one-off invocation:

```bash
npx --yes embedino --help
```

The CLI can start or serve an Embedino backend, pair a workspace, manage projects, and connect to supported providers. The desktop release is distributed separately through [GitHub Releases](https://github.com/embedino/embedino/releases).

## Release channels

| Channel | Purpose | Distribution |
| --- | --- | --- |
| Stable | Public, versioned releases | Latest GitHub release and npm `latest` |
| Nightly | Fast-moving builds for testers | GitHub prerelease and npm `nightly` |

Desktop artifacts target macOS arm64/x64, Linux x64 AppImage, and Windows x64 NSIS installers. Nightly builds use the same platform matrix and are marked prerelease.

## Build from source

```bash
git clone https://github.com/embedino/embedino.git
cd embedino/core
pnpm install
pnpm run tc
pnpm run test
pnpm run build:desktop
```

## Project Structure

```text
embedino-workspace/
├── docs/             # Technical specifications & design notes
├── core/             # Web, desktop, server, packages, and release tooling
├── docs/             # Technical specifications & launch notes
└── logo.svg          # Public brand mark
```

---

## Getting Started

> [!NOTE]
> Stable releases are for general use. Nightly releases are for testers and contributors and may contain unfinished changes.

To follow progress or contribute to early feedback:

1. **Download a desktop build**: [GitHub Releases](https://github.com/embedino/embedino/releases)
2. **Install the CLI**: `npm install --global embedino`
3. **Report a problem**: use the focused [bug report](https://github.com/embedino/embedino/issues/new?template=bug_report.yml) or [tester feedback](https://github.com/embedino/embedino/issues/new?template=tester_feedback.yml) form.

---

## Philosophy

Hardware development shouldn't be hard. Traditional embedded workflows are often fractured across legacy toolchains, inconsistent environment setups, and fragmented hardware abstractions. 

Embedino is engineered to restore clarity to the development lifecycle—combining modern tooling standards with low-level execution performance.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with precision by the Embedino core team.</sub>
</div>
