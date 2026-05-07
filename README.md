# Ruleloom Lab

[English](README.md) | [中文](README-zh.md) | [日本語](README-ja.md)


Ruleloom Lab is a local-first browser playground for elementary cellular automata: type a Wolfram rule number, choose a seed, and watch tiny neighborhood rules weave surprising visual patterns.

## Problem and Motivation

Elementary cellular automata are easy to define but hard to understand from rule numbers alone. Ruleloom Lab gives teachers, learners, creative coders, and curious developers a private, install-light way to explore how three-cell binary neighborhoods produce complex behavior over time.

## Features

- Rule number input from 0 to 255.
- Width, generation count, and seed controls with predictable clamping.
- Center, deterministic random, and custom bit-string seed modes.
- Boundary mode control for comparing fixed-zero edges with wrapped circular edges.
- Accessible HTML/CSS automata grid.
- Rule table for neighborhoods from `111` to `000`.
- Step, reset, run, and share controls.
- Keyboard shortcuts: Space toggles Run/Pause, ArrowRight or `.` steps, `R` resets, and number keys `1`-`4` choose the visible presets.
- Copy text action for portable monospaced pattern exports with rule, width, generation, seed, and boundary metadata.
- Copy SVG action for standalone pattern snapshots.
- Copy RLE action for deterministic Life/RLE-style text exports of the currently visible generations.
- Curated presets for Rule 30, Rule 90, Rule 110, and Rule 184 with short learner-facing explanations.
- Pure deterministic engine exported from `src/automata.ts`.
- Query-string import and export helpers in `src/share.ts`.
- Deterministic plain-text pattern exporter in `src/textExport.ts`.
- Deterministic SVG pattern exporter in `src/svgExport.ts`.
- Deterministic RLE-like pattern exporter in `src/rleExport.ts`.

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

Use the Boundary control to compare the default fixed-zero edges with wrapped circular edges without changing the rule or seed.

Use keyboard shortcuts when focus is not inside a form control: Space for Run/Pause, ArrowRight or `.` for Step, `R` for Reset, and `1`-`4` for Rule 30, Rule 90, Rule 110, and Rule 184 in visible preset order.

## Examples

Restore a deterministic Rule 90 exploration from a URL query string:

```text
?rule=90&width=61&steps=80&seed=center&boundary=fixed
```

Try the Rule 30 preset for chaotic pseudo-random growth, Rule 90 for nested Sierpinski triangles, Rule 110 for computationally universal behavior, or Rule 184 for traffic-flow movement. The app shows these explanations next to the preset controls.

Switch `boundary=wrap` in a share URL to make the left and right edges read each other as neighbors.

## Configuration

The app is configured in the browser UI or with URL query parameters:

- `rule`: integer from 0 to 255.
- `width`: grid width, clamped from 15 to 121 cells.
- `steps`: displayed generations, clamped from 1 to 160 rows.
- `seed`: `center`, `random`, or `custom`.
- `boundary`: `fixed` for zero-valued outer neighbors or `wrap` for circular edge neighbors. Invalid values fall back to `fixed`.
- `randomSeed`: deterministic numeric random seed.
- `customSeed`: bit string used when `seed=custom`.

Invalid numeric values are clamped to the supported ranges. Missing boundary settings use `fixed` for backward compatibility.

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

Ruleloom Lab uses Vitest for behavior-focused tests around rule decoding, fixed and wrapped boundary generation, deterministic seeds, URL query helpers, preset explanations, keyboard shortcuts, plain-text export, SVG export, RLE-like export, clipboard copy behavior, and rendered HTML structure.

```bash
npm test -- --run
```

## Roadmap

- Export PNG pattern snapshots.
- Add side-by-side rule comparison.
- Add shareable gallery examples in documentation.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), keep changes small, and include behavior-focused tests for new automata behavior or UI changes.

## License

MIT. See [LICENSE](LICENSE).

## AI-Assisted Maintenance

This project is written and maintained with AI assistance, with local tests and CI used to verify changes before release.
