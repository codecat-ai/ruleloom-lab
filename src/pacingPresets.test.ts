import { describe, expect, it } from "vitest";
import { LESSON_PATHS } from "./lessonPaths";
import {
  applyPacingPresetToLessonPath,
  formatPacingGuide,
  getPacingPreset,
  listPacingPresets,
} from "./pacingPresets";

describe("pacing presets", () => {
  it("lists immutable pacing preset metadata and supports lookup", () => {
    expect(listPacingPresets()).toEqual([
      {
        id: "bell-ringer",
        label: "Bell-ringer",
        totalMinutes: 12,
        audience: "Short 10-12 minute opening activity",
      },
      {
        id: "standard",
        label: "Standard",
        totalMinutes: 24,
        audience: "Normal classroom lesson path",
      },
      {
        id: "workshop",
        label: "Workshop",
        totalMinutes: 45,
        audience: "Longer 35-45 minute exploration",
      },
    ]);

    const presets = listPacingPresets();
    presets[0].label = "Changed outside";

    expect(getPacingPreset("bell-ringer")).toEqual({
      id: "bell-ringer",
      label: "Bell-ringer",
      totalMinutes: 12,
      audience: "Short 10-12 minute opening activity",
    });
  });

  it("applies bell-ringer and workshop pacing differently without mutating the lesson path", () => {
    const path = LESSON_PATHS[0];
    const before = JSON.stringify(path);

    const bellRinger = applyPacingPresetToLessonPath(path, "bell-ringer");
    const workshop = applyPacingPresetToLessonPath(path, "workshop");

    expect(bellRinger.totalMinutes).toBe(12);
    expect(workshop.totalMinutes).toBe(45);
    expect(bellRinger.steps.map((step) => step.suggestedMinutes)).toEqual([
      4, 4, 4,
    ]);
    expect(workshop.steps.map((step) => step.suggestedMinutes)).toEqual([
      15, 15, 15,
    ]);
    expect(bellRinger.steps[0].facilitatorCue).toContain("Quick scan");
    expect(workshop.steps[0].facilitatorCue).toContain("Deep dive");
    expect(JSON.stringify(path)).toBe(before);
  });

  it("throws a domain-level helpful error for unknown preset ids", () => {
    expect(() =>
      applyPacingPresetToLessonPath(LESSON_PATHS[0], "after-school"),
    ).toThrow(
      'Unknown pacing preset "after-school". Choose bell-ringer, standard, or workshop.',
    );
  });

  it("formats a deterministic facilitator-friendly pacing guide", () => {
    const pacing = applyPacingPresetToLessonPath(
      LESSON_PATHS[0],
      "bell-ringer",
    );

    expect(formatPacingGuide(pacing)).toBe(`Ruleloom Lab pacing guide
Lesson: Patterns from one spark
Preset: Bell-ringer
Total: 12 minutes
Use case: Short 10-12 minute opening activity

1. 0-4 min | Explore | Step 1
Cue: Quick scan: What simple visual rule could explain the repeating triangular gaps?

2. 4-8 min | Compare | Step 2
Cue: Quick compare: Which streaks look random, and which details repeat when the seed stays fixed?

3. 8-12 min | Reflect | Step 3
Cue: Quick share-out: Where do the moving lanes split, collide, or keep their spacing?`);
  });
});
