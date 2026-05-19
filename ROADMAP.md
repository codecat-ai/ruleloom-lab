# Ruleloom Lab Roadmap

## Maturity and Cadence

Ruleloom Lab is in maintenance cadence after the local lesson path pacing preset completion review. The product surface is broad enough for local classroom use, so new work should be small, behavior-tested, and tied to compatibility, accessibility, documentation, or existing local facilitator artifacts.

Review cadence: quarterly maintenance checks, with interim updates only for security, dependency, browser compatibility, accessibility, or data-loss fixes.

## Now

- Keep the local lesson path pacing presets, workshop checklist, teacher notes, session summary, and export artifacts covered by deterministic behavior tests.
- Keep CI green on `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.

## Next

- Maintenance phase: make small compatibility, accessibility, copy, and local artifact refinements when they improve existing classroom flows.

## Later

- Improve import/export ergonomics only where local classroom reuse exposes friction.
- Consider small accessibility and print-layout refinements for existing facilitator artifacts.
- Avoid adding accounts, sync, analytics, uploads, or network-dependent classroom workflows.

## Maintenance Triggers

- Move to maintenance cadence when README-documented classroom flows are covered by deterministic tests, no Next item remains urgent, and recent changes are mostly documentation, compatibility, or dependency upkeep.
- Return temporarily to growth cadence if local-first lesson workflows expose missing facilitator artifacts or if browser platform changes break core exports.
- Prioritize security, dependency, accessibility, and data-loss fixes over new learning features.

## Cadence Review Notes

- Each cadence review should record whether the current state remains maintenance or needs a temporary return to growth for a focused local-first gap.
- Reviews should check open issues/PRs, CI status, roadmap freshness, and whether new features still match the local-first classroom scope.
- If a review changes cadence, update this file and the README roadmap summary in the same change.

## Completion Review

Pacing presets shipped with deterministic API, UI, and copy-artifact coverage. No urgent user-facing feature gap remains in the local-first classroom scope, so Ruleloom Lab is lowered to maintenance cadence with one maintenance-oriented next phase.
