# Ruleloom Lab Roadmap

## Maturity and Cadence

Ruleloom Lab is in growth moving toward maintenance. The product surface is already broad enough for local classroom use, so new work should be small, behavior-tested, and tied to reusable facilitation value.

Review cadence: monthly while active roadmap items remain. If no user-facing gaps are found in a review cycle, lower to quarterly maintenance checks.

## Now

- Stabilize the new local workshop checklist run sheet through use in README examples, behavior tests, and small copy refinements only when they improve facilitator reuse.
- Keep CI green on `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.

## Next

- Add optional local lesson path pacing presets for shorter bell-ringers and longer workshops.
- Run a completion review to decide whether Ruleloom Lab should lower cadence from growth toward maintenance.

## Later

- Improve import/export ergonomics only where local workshop reuse exposes friction.
- Consider small accessibility and print-layout refinements for existing facilitator artifacts.
- Avoid adding accounts, sync, analytics, uploads, or network-dependent classroom workflows.

## Maintenance Triggers

- Move to maintenance cadence when README-documented classroom flows are covered by deterministic tests, no Next item remains urgent, and recent changes are mostly documentation, compatibility, or dependency upkeep.
- Return temporarily to growth cadence if local-first lesson workflows expose missing facilitator artifacts or if browser platform changes break core exports.
- Prioritize security, dependency, accessibility, and data-loss fixes over new learning features.

## Cadence Review Notes

- Each cadence review should record whether the current state is growth, growth moving toward maintenance, or maintenance.
- Reviews should check open issues/PRs, CI status, roadmap freshness, and whether new features still match the local-first classroom scope.
- If a review changes cadence, update this file and the README roadmap summary in the same change.

## Completion Review Rule

After pacing presets ship, or if pacing presets are deferred, run a completion review before accepting additional feature work. The review must decide whether to lower cadence to maintenance, keep one focused Next item, or explicitly close the roadmap as maintenance-only.
