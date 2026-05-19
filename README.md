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
- Copy session summary action for a deterministic plain-text facilitator artifact that combines the current setup, comparison summary, selected preset/gallery/lesson context, prompts, generation annotations, and export handoff hints.
- Copy workshop checklist action for a deterministic reusable run sheet that ties the current rules, selected preset or lesson context, comparison focus, facilitator notes, timing cues, checklist steps, and reflection prompts into one local artifact.
- Curated presets for Rule 30, Rule 90, Rule 110, and Rule 184 with short learner-facing explanations.
- Product-shaped Gallery examples section with four curated, apply-ready local setups, including wrapped-boundary and custom-seed cases.
- Gallery filters for seed type, boundary mode, and classroom difficulty, with an empty state when no examples match.
- Lesson paths that sequence existing gallery examples into named classroom investigations with estimated minutes and discussion prompts.
- Optional local lesson path pacing presets for Bell-ringer, Standard, and Workshop facilitation, including deterministic minute ranges, phase labels, concise cues, and a copyable plain-text pacing guide.
- Copy and paste lesson path pack JSON locally, with validation for safe ids, prompts, rules, seeds, and boundary values; imported packs stay in the current browser session with no accounts or sync.
- Local generation annotations for marking notable rows during facilitation, with labels, optional notes, remove controls, and copy/paste JSON import for the current browser session.
- Saved local comparison sets for recurring workshops, capturing title, optional note, both rules, width, generation count, seed mode/value, random seed, boundary mode, and schema version in browser storage with copy/paste JSON portability.
- Pure deterministic engine exported from `src/automata.ts`.
- Pure curated gallery metadata and apply helper exported from `src/gallery.ts`.
- Pure lesson path metadata and safe step-application helpers exported from `src/lessonPaths.ts`.
- Pure deterministic lesson path pack import/export helpers exported from `src/lessonPathPacks.ts`.
- Pure deterministic lesson timing cue schedule and plain-text formatter helpers exported from `src/timingCues.ts`.
- Pure deterministic lesson pacing preset metadata, apply, and formatting helpers exported from `src/pacingPresets.ts`.
- Pure local generation annotation helpers exported from `src/generationAnnotations.ts`.
- Pure saved comparison set validation, storage, import/export, and apply helpers exported from `src/comparisonSets.ts`.
- Pure deterministic session summary formatter exported from `src/sessionSummaries.ts`.
- Pure deterministic workshop checklist run-sheet formatter exported from `src/workshopChecklists.ts`.
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

Use the Pacing preset control above Lesson paths to switch between a 12-minute Bell-ringer, 24-minute Standard path, and 45-minute Workshop exploration. The visible timing ranges and Copy timing cues artifact use the same selected preset, so local handoff notes match what facilitators saw on screen.

Use Copy built-in lesson paths to copy deterministic lesson path pack JSON. Paste a local pack into the Lesson paths import box to add those paths for the current browser session only; malformed JSON, duplicate ids, unsafe text fields, and invalid rule/seed/boundary settings are rejected locally.

Use Generation annotations to mark the currently visible generation with a short label and optional note while facilitating. Copy annotations JSON to carry those local marks into another session, or paste/import annotation JSON; malformed schema versions, missing fields, invalid generations, and empty labels are rejected locally.

Use Saved comparison sets to store recurring workshop setups in this browser. Each set records the current primary rule, comparison rule, width, generation count, seed mode, random seed, custom seed, boundary mode, title, optional note, and schema version. Apply a set to restore the comparison, remove it when it is no longer useful, or copy/paste sets JSON to move the local list between browsers without accounts, network calls, or uploads.

Use Print teacher notes to prepare a local printable HTML sheet for the current setup. The notes include the active rule, seed, boundary mode, comparison summary, rule table, visible generated rows, selected preset/gallery/lesson context when available, and discussion prompts.

Use Copy session summary when you need a lightweight facilitator handoff instead of a print sheet. The copied summary includes the current visible rule setup, comparison result, selected preset/gallery/lesson context when available, discussion prompts, local generation annotations, and reminders for PNG, SVG, plain-text, RLE, and teacher-note exports.

Use Copy workshop checklist when you want a reusable local run sheet for the visible facilitation context. The copied sheet combines the active and comparison rules, selected preset or lesson path, comparison focus, facilitator notes, timing cues, setup checklist, and reflection prompts without uploading anything.

## Examples

Restore a deterministic Rule 90 exploration from a URL query string:

```text
?rule=90&width=61&steps=80&seed=center&boundary=fixed
```

Try the Rule 30 preset for chaotic pseudo-random growth, Rule 90 for nested Sierpinski triangles, Rule 110 for computationally universal behavior, or Rule 184 for traffic-flow movement. The app shows these explanations next to the preset controls.

Apply Sierpinski lattice for a clean Rule 90 center-seed fractal, Wrapped traffic loop for Rule 184 with circular edges, Rule 30 noise field for repeatable deterministic disorder, or Custom seed lanes for a hand-shaped Rule 110 start.

Filter Gallery examples to find a beginner center-seed activity, an intermediate fixed-boundary random-seed activity, or an advanced custom-seed activity for a classroom sequence.

Run Patterns from one spark for a 12-minute path from Rule 90 center seed to Rule 30 deterministic noise and Rule 110 custom lanes. Run Edges change the story for a 10-minute boundary-focused path from fixed edges to wrapped traffic.

Choose Workshop pacing, then copy the timing cues for Patterns from one spark to get a 45-minute guide with Explore, Compare, and Reflect ranges from 0-15, 15-30, and 30-45 minutes. Choose Bell-ringer for a 12-minute opening version with 0-4, 4-8, and 8-12 minute ranges.

Copy the built-in lesson path pack, edit the JSON title and prompts in a local file, then paste it back as a session-only pack for a workshop variation.

Switch `boundary=wrap` in a share URL to make the left and right edges read each other as neighbors.

Set the main rule to `30` and Compare with rule to `90` to see a deterministic divergence summary for the same board.

Step to a partial run, then use Download PNG to capture only the visible rows as a filename-safe snapshot such as `ruleloom-rule-90-w61-g12-center-fixed.png`.

Apply a lesson path step, change Compare with rule, then use Print teacher notes to create a facilitator handout that records the exact visible rows and discussion prompts for that classroom moment.

During a live run, step to a notable generation and add a Generation annotation such as `First asymmetry` or `Traffic jam forms`; copy the annotations JSON after the session to keep the marks without uploading anything.

After a facilitated run, use Copy session summary to capture the visible board setup, the current comparison result, the selected context, annotations, and export options in one copyable text note.

Before handing a session to another facilitator, use Copy workshop checklist to create a concise run sheet that connects the saved comparison setup, the selected lesson path, timing cue, teacher-note prompts, and reflection questions.

Before a recurring workshop, save comparison sets such as `Traffic boundary contrast` or `Sierpinski warmup`. At the next session, apply the saved set to restore both rules, the board size, generation count, seed settings, and boundary mode in one click.

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

Saved comparison sets are stored in browser storage under a versioned local key and can also be copied as JSON. Imports validate the schema version, safe ids, bounded title and note strings, rule ranges, width and generation ranges, seed mode/value, random seed, boundary mode, and legacy records that omit optional note or seed fields.

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

Ruleloom Lab uses Vitest for behavior-focused tests around rule decoding, fixed and wrapped boundary generation, deterministic seeds, curated gallery metadata, gallery filtering and apply behavior, lesson path metadata and step application, lesson path timing cue schedules and plain-text sheets, lesson path pacing presets and pacing-aware copied artifacts, lesson path pack import/export validation, generation annotation validation/import/export/sorting, saved comparison set validation/storage/import/export/apply behavior, session summary formatting, workshop checklist run-sheet formatting, projector mode labels/status/classes, rule comparison summaries, teacher notes formatting and print helpers, URL query helpers, preset explanations, keyboard shortcuts, plain-text export, SVG export, RLE-like export and import, PNG export rendering and filenames, clipboard/download behavior, and rendered HTML structure.

```bash
npm test -- --run
```

## Roadmap

Ruleloom Lab is now on maintenance cadence. The next phase is small compatibility, accessibility, copy, and local artifact upkeep while keeping the classroom workflow local-first.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), keep changes small, and include behavior-focused tests for new automata behavior or UI changes.

## License

MIT. See [LICENSE](LICENSE).

## AI-Assisted Maintenance

This project is written and maintained with AI assistance, with local tests and CI used to verify changes before release.
