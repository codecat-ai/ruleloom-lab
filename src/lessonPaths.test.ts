import { describe, expect, it } from "vitest";
import { GALLERY_EXAMPLES } from "./gallery";
import {
  applyLessonPathStep,
  getLessonPath,
  getLessonPathStep,
  LESSON_PATHS,
  listLessonPaths,
} from "./lessonPaths";

describe("lesson paths", () => {
  it("defines stable lesson paths from existing gallery example ids", () => {
    expect(LESSON_PATHS.map((path) => path.id)).toEqual([
      "patterns-from-one-spark",
      "edges-change-the-story",
    ]);
    expect(
      LESSON_PATHS.flatMap((path) =>
        path.steps.map((step) => step.galleryExampleId),
      ),
    ).toEqual([
      "sierpinski-center",
      "rule-30-random-field",
      "custom-seed-glider-lanes",
      "sierpinski-center",
      "wrapped-traffic-loop",
      "wrapped-traffic-loop",
    ]);
    expect(
      LESSON_PATHS.flatMap((path) => path.steps).every((step) =>
        GALLERY_EXAMPLES.some((example) => example.id === step.galleryExampleId),
      ),
    ).toBe(true);
  });

  it("returns copied path metadata for list and lookup helpers", () => {
    const listed = listLessonPaths();
    const originalTitle = LESSON_PATHS[0].title;

    listed[0].title = "Changed outside";
    listed[0].steps[0].prompt = "Changed prompt";

    expect(LESSON_PATHS[0].title).toBe(originalTitle);
    expect(LESSON_PATHS[0].steps[0].prompt).not.toBe("Changed prompt");
    expect(getLessonPath("patterns-from-one-spark")).toEqual(LESSON_PATHS[0]);
    expect(getLessonPath("missing-path")).toBeNull();
  });

  it("resolves steps with copied gallery metadata", () => {
    const resolved = getLessonPathStep("patterns-from-one-spark", 0);

    expect(resolved).toMatchObject({
      pathId: "patterns-from-one-spark",
      stepIndex: 0,
      prompt: expect.stringContaining("simple"),
      example: {
        id: "sierpinski-center",
        settings: {
          rule: 90,
          seedMode: "center",
          boundaryMode: "fixed",
        },
      },
    });
    expect(resolved?.example).not.toBe(
      GALLERY_EXAMPLES.find((example) => example.id === "sierpinski-center"),
    );
    expect(resolved?.example.settings).not.toBe(
      GALLERY_EXAMPLES.find((example) => example.id === "sierpinski-center")
        ?.settings,
    );
  });

  it("returns null for invalid path ids and step indexes", () => {
    expect(getLessonPathStep("missing-path", 0)).toBeNull();
    expect(getLessonPathStep("patterns-from-one-spark", -1)).toBeNull();
    expect(getLessonPathStep("patterns-from-one-spark", 99)).toBeNull();
    expect(getLessonPathStep("patterns-from-one-spark", 1.5)).toBeNull();
    expect(applyLessonPathStep("missing-path", 0)).toBeNull();
    expect(applyLessonPathStep("patterns-from-one-spark", 99)).toBeNull();
  });

  it("applies a lesson path step without mutating source objects", () => {
    const before = JSON.stringify(LESSON_PATHS);
    const applied = applyLessonPathStep("patterns-from-one-spark", 2);

    expect(applied).toEqual({
      rule: 110,
      width: 73,
      generations: 100,
      seedMode: "custom",
      boundaryMode: "fixed",
      randomSeed: 1,
      customSeed:
        "0000000000000000000000000000000011101000100111000000000000000000000000000",
      comparisonRule: 54,
    });
    expect(JSON.stringify(LESSON_PATHS)).toBe(before);
  });
});
