# Ruleloom Lab

[English](README.md) | [中文](README-zh.md) | [日本語](README-ja.md)


Ruleloom Lab is a local-first browser playground for elementary cellular automata: type a Wolfram rule number, choose a seed, and watch tiny neighborhood rules weave surprising visual patterns.

## Problem and Motivation

Elementary cellular automata are easy to define but hard to understand from rule numbers alone. Ruleloom Lab gives teachers, learners, creative coders, and curious developers a private, install-light way to explore how three-cell binary neighborhoods produce complex behavior over time.

## Features

- Rule number input from 0 to 255.
- Width, generation count, and seed controls with predictable clamping.
- Center, deterministic random, and custom bit-string seed modes.
- Accessible HTML/CSS automata grid.
- Rule table for neighborhoods from `111` to `000`.
- Step, reset, run, and share controls.
- Curated presets for Rule 30, Rule 90, Rule 110, and Rule 184.
- Pure deterministic engine exported from `src/automata.ts`.
- Query-string import and export helpers in `src/share.ts`.

## Installation

Ruleloom Lab is published on GitHub only. It is not published to npm or any package registry yet, so use the repository workflow:

```bash
git clone https://github.com/codecat-ai/ruleloom-lab.git
cd ruleloom-lab
npm ci
```

## Quick Start

```bash
npm run dev
```

Open the printed local URL in a browser.

## Examples

Restore a deterministic Rule 90 exploration from a URL query string:

```text
?rule=90&width=61&steps=80&seed=center
```

Try the Rule 30 preset for chaotic-looking growth, Rule 90 for a Sierpinski-style triangle, Rule 110 for complex behavior, or Rule 184 for traffic-like movement.

## Configuration

The app is configured in the browser UI or with URL query parameters:

- `rule`: integer from 0 to 255.
- `width`: grid width, clamped from 15 to 121 cells.
- `steps`: displayed generations, clamped from 1 to 160 rows.
- `seed`: `center`, `random`, or `custom`.
- `randomSeed`: deterministic numeric random seed.
- `customSeed`: bit string used when `seed=custom`.

Invalid numeric values are clamped to the supported ranges.

## Development

```bash
npm ci
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

The app is intentionally local-first: no server, accounts, analytics, uploads, or external API calls are required for normal use.

## Testing

Ruleloom Lab uses Vitest for behavior-focused tests around rule decoding, generation, deterministic seeds, URL query helpers, and rendered HTML structure.

```bash
npm test -- --run
```

## Roadmap

- Export SVG or PNG pattern snapshots.
- Add explanatory annotations for each preset.
- Add side-by-side rule comparison.
- Add keyboard shortcuts for stepping and preset selection.
- Add shareable gallery examples in documentation.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), keep changes small, and include behavior-focused tests for new automata behavior or UI changes.

## License

MIT. See [LICENSE](LICENSE).

## AI-Assisted Maintenance

This project is written and maintained with AI assistance, with local tests and CI used to verify changes before release.
