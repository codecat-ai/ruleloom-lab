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
- Side-by-side rule comparison summary for the active rule and a second Wolfram rule over the current board settings.
- Accessible HTML/CSS automata grid.
- Rule table for neighborhoods from `111` to `000`.
- Step, reset, run, and share controls.
- Projector mode toggle that enlarges the automaton, keeps presentation status visible, and hides secondary controls for live facilitation.
- Keyboard shortcuts: Space toggles Run/Pause, ArrowRight or `.` steps, `R` resets, and number keys `1`-`4` choose the visible presets.
- Copy text action for portable monospaced pattern exports with rule, width, generation, seed, and boundary metadata.
- Copy SVG action for standalone pattern snapshots.
- Copy RLE action for deterministic Life/RLE-style text exports of the currently visible generations.
- Paste RLE import action for restoring Ruleloom RLE exports into editable custom seed settings.
- Download PNG action for local pattern snapshots of the currently visible generations.
- Print teacher notes action for a deterministic, escaped, copy-friendly HTML notes sheet covering the current setup, comparison, rule table, selected preset/gallery/lesson context, generated rows, and discussion prompts.
- Curated presets for Rule 30, Rule 90, Rule 110, and Rule 184 with short learner-facing explanations.
- Product-shaped Gallery examples section with four curated, apply-ready local setups, including wrapped-boundary and custom-seed cases.
- Gallery filters for seed type, boundary mode, and classroom difficulty, with an empty state when no examples match.
- Lesson paths that sequence existing gallery examples into named classroom investigations with estimated minutes and discussion prompts.
- Copy and paste lesson path pack JSON locally, with validation for safe ids, prompts, rules, seeds, and boundary values; imported packs stay in the current browser session with no accounts or sync.
- Pure deterministic engine exported from `src/automata.ts`.
- Pure curated gallery metadata and apply helper exported from `src/gallery.ts`.
- Pure lesson path metadata and safe step-application helpers exported from `src/lessonPaths.ts`.
- Pure deterministic lesson path pack import/export helpers exported from `src/lessonPathPacks.ts`.
- Query-string import and export helpers in `src/share.ts`.
- Deterministic plain-text pattern exporter in `src/textExport.ts`.
- Deterministic SVG pattern exporter in `src/svgExport.ts`.
- Deterministic RLE-like pattern exporter in `src/rleExport.ts`.
- Pure Ruleloom RLE import parser in `src/rleImport.ts`.
- Deterministic PNG export helper in `src/pngExport.ts` with injectable canvas encoding for unit tests.

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

Use Compare with rule to see the first generation where two rules diverge and the total differing cells for the current width, generation count, seed, and boundary mode.

Use keyboard shortcuts when focus is not inside a form control: Space for Run/Pause, ArrowRight or `.` for Step, `R` for Reset, and `1`-`4` for Rule 30, Rule 90, Rule 110, and Rule 184 in visible preset order.

Use Projector mode during live facilitation to enlarge the current automaton, keep the rule/width/row/boundary status visible, and reduce secondary classroom clutter. Exit projector mode to bring the full controls back without changing the local setup.

Use Download PNG to save a local snapshot of the currently visible generations. PNG export runs in the browser with no uploads.

Use Paste Ruleloom RLE and Import RLE to restore a copied Ruleloom RLE export locally. The import reads the Ruleloom `W<number>` header, width, visible generation count, boundary metadata, and custom seed metadata when present; otherwise it derives the custom seed from the first decoded row.

Use Gallery examples to apply a complete curated setup. Filter the cards by seed type, boundary mode, or classroom difficulty, then apply any visible example. Each card updates the rule, width, generations, seed mode, seed value, boundary mode, and comparison rule when provided, then resets the visible playback to the first row so you can watch the pattern unfold.

Use Lesson paths when you want a short guided sequence instead of standalone cards. Each step applies an existing gallery setup, resets playback to the first row, and gives a discussion prompt for observation.

Use Copy built-in lesson paths to copy deterministic lesson path pack JSON. Paste a local pack into the Lesson paths import box to add those paths for the current browser session only; malformed JSON, duplicate ids, unsafe text fields, and invalid rule/seed/boundary settings are rejected locally.

Use Print teacher notes to prepare a local printable HTML sheet for the current setup. The notes include the active rule, seed, boundary mode, comparison summary, rule table, visible generated rows, selected preset/gallery/lesson context when available, and discussion prompts.

## Examples

Restore a deterministic Rule 90 exploration from a URL query string:

```text
?rule=90&width=61&steps=80&seed=center&boundary=fixed
```

Try the Rule 30 preset for chaotic pseudo-random growth, Rule 90 for nested Sierpinski triangles, Rule 110 for computationally universal behavior, or Rule 184 for traffic-flow movement. The app shows these explanations next to the preset controls.

Apply Sierpinski lattice for a clean Rule 90 center-seed fractal, Wrapped traffic loop for Rule 184 with circular edges, Rule 30 noise field for repeatable deterministic disorder, or Custom seed lanes for a hand-shaped Rule 110 start.

Filter Gallery examples to find a beginner center-seed activity, an intermediate fixed-boundary random-seed activity, or an advanced custom-seed activity for a classroom sequence.

Run Patterns from one spark for a 12-minute path from Rule 90 center seed to Rule 30 deterministic noise and Rule 110 custom lanes. Run Edges change the story for a 10-minute boundary-focused path from fixed edges to wrapped traffic.

Copy the built-in lesson path pack, edit the JSON title and prompts in a local file, then paste it back as a session-only pack for a workshop variation.

Switch `boundary=wrap` in a share URL to make the left and right edges read each other as neighbors.

Set the main rule to `30` and Compare with rule to `90` to see a deterministic divergence summary for the same board.

Step to a partial run, then use Download PNG to capture only the visible rows as a filename-safe snapshot such as `ruleloom-rule-90-w61-g12-center-fixed.png`.

Apply a lesson path step, change Compare with rule, then use Print teacher notes to create a facilitator handout that records the exact visible rows and discussion prompts for that classroom moment.

Switch on Projector mode after choosing a gallery example or lesson path step to present the enlarged board while keeping Step, Reset, Run, and preset controls close at hand.

Copy RLE and later paste it back into Import RLE to continue editing from the saved rule, width, visible rows, boundary mode, and custom seed:

```text
# Ruleloom Lab
# rule: 90
# width: 15
# generations: 3
# seed mode: center
# boundary mode: fixed
x = 15, y = 3, rule = W90
7bo7b$6bobo6b$5bo3bo5b!
```

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

RLE import accepts Ruleloom's own deterministic text exports only. It decodes `b`, `o`, numeric run counts, `$` row separators, and the final `!` terminator, then applies the result as `seed=custom` with `boundary=fixed` unless the export metadata says `wrap`.

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

Ruleloom Lab uses Vitest for behavior-focused tests around rule decoding, fixed and wrapped boundary generation, deterministic seeds, curated gallery metadata, gallery filtering and apply behavior, lesson path metadata and step application, lesson path pack import/export validation, projector mode labels/status/classes, rule comparison summaries, teacher notes formatting and print helpers, URL query helpers, preset explanations, keyboard shortcuts, plain-text export, SVG export, RLE-like export and import, PNG export rendering and filenames, clipboard/download behavior, and rendered HTML structure.

```bash
npm test -- --run
```

## Roadmap

- Add local annotation layers for marking notable generations during facilitation.
- Add saved local comparison sets for recurring workshops.
- Add local facilitator timing cues for lesson path steps.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), keep changes small, and include behavior-focused tests for new automata behavior or UI changes.

## License

MIT. See [LICENSE](LICENSE).

## AI-Assisted Maintenance

This project is written and maintained with AI assistance, with local tests and CI used to verify changes before release.
