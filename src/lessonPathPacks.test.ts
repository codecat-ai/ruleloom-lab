import { describe, expect, it } from "vitest";
import { LESSON_PATHS } from "./lessonPaths";
import {
  exportLessonPathPack,
  importLessonPathPack,
  LESSON_PATH_PACK_SCHEMA_VERSION,
} from "./lessonPathPacks";

const validPackJson = JSON.stringify({
  schemaVersion: LESSON_PATH_PACK_SCHEMA_VERSION,
  lessonPaths: [
    {
      id: "local-wrap-study",
      title: "Local wrap study",
      summary: "Compare wrapped motion with a small deterministic seed.",
      estimatedMinutes: 8,
      audience: "Small group",
      steps: [
        {
          prompt: "Where does the moving band re-enter the row?",
          settings: {
            rule: 184,
            width: 31,
            generations: 24,
            seedMode: "random",
            boundaryMode: "wrap",
            randomSeed: 184,
            customSeed: "",
          },
          comparisonRule: 226,
        },
      ],
    },
  ],
});

describe("lesson path packs", () => {
  it("exports deterministic JSON with schema version and copied lesson paths", () => {
    const exported = exportLessonPathPack(LESSON_PATHS);

    expect(exported).toBe(exportLessonPathPack(LESSON_PATHS));
    expect(JSON.parse(exported)).toEqual({
      schemaVersion: LESSON_PATH_PACK_SCHEMA_VERSION,
      lessonPaths: LESSON_PATHS,
    });
    expect(exported).not.toContain("exportedAt");
    expect(exported).not.toContain("exportedBy");
  });

  it("imports valid local lesson path packs as clone-safe paths", () => {
    const imported = importLessonPathPack(validPackJson);
    const beforeBuiltIns = JSON.stringify(LESSON_PATHS);

    expect(imported).toEqual([
      {
        id: "local-wrap-study",
        title: "Local wrap study",
        summary: "Compare wrapped motion with a small deterministic seed.",
        estimatedMinutes: 8,
        audience: "Small group",
        steps: [
          {
            prompt: "Where does the moving band re-enter the row?",
            settings: {
              rule: 184,
              width: 31,
              generations: 24,
              seedMode: "random",
              boundaryMode: "wrap",
              randomSeed: 184,
              customSeed: "",
            },
            comparisonRule: 226,
          },
        ],
      },
    ]);

    imported[0].title = "Changed outside";
    imported[0].steps[0].prompt = "Changed prompt";

    expect(importLessonPathPack(validPackJson)[0].title).toBe(
      "Local wrap study",
    );
    expect(JSON.stringify(LESSON_PATHS)).toBe(beforeBuiltIns);
  });

  it("rejects malformed JSON with a clear message", () => {
    expect(() => importLessonPathPack("{")).toThrow(
      "Lesson path pack import failed: paste valid JSON.",
    );
  });

  it("rejects unsupported schema versions", () => {
    expect(() =>
      importLessonPathPack(
        JSON.stringify({ schemaVersion: 99, lessonPaths: [] }),
      ),
    ).toThrow("Lesson path pack schema version 99 is not supported.");
  });

  it("rejects duplicate path ids", () => {
    const pack = JSON.parse(validPackJson);
    pack.lessonPaths.push({ ...pack.lessonPaths[0] });

    expect(() => importLessonPathPack(JSON.stringify(pack))).toThrow(
      'Lesson path pack has a duplicate path id: "local-wrap-study".',
    );
  });

  it("rejects unsafe or empty ids, titles, and prompts", () => {
    const pack = JSON.parse(validPackJson);
    pack.lessonPaths[0].id = "../unsafe";

    expect(() => importLessonPathPack(JSON.stringify(pack))).toThrow(
      "Lesson path 1 needs a safe id using letters, numbers, and hyphens.",
    );

    pack.lessonPaths[0].id = "safe-id";
    pack.lessonPaths[0].title = " ";

    expect(() => importLessonPathPack(JSON.stringify(pack))).toThrow(
      "Lesson path safe-id needs a non-empty title.",
    );

    pack.lessonPaths[0].title = "Safe title";
    pack.lessonPaths[0].steps[0].prompt = "";

    expect(() => importLessonPathPack(JSON.stringify(pack))).toThrow(
      "Lesson path safe-id step 1 needs a non-empty prompt.",
    );
  });

  it("rejects missing and invalid step fields", () => {
    const missingSettings = JSON.parse(validPackJson);
    delete missingSettings.lessonPaths[0].steps[0].settings;

    expect(() => importLessonPathPack(JSON.stringify(missingSettings))).toThrow(
      "Lesson path local-wrap-study step 1 needs either a galleryExampleId or local settings.",
    );

    const invalidGalleryStep = JSON.parse(validPackJson);
    delete invalidGalleryStep.lessonPaths[0].steps[0].settings;
    invalidGalleryStep.lessonPaths[0].steps[0].galleryExampleId = "missing";

    expect(() =>
      importLessonPathPack(JSON.stringify(invalidGalleryStep)),
    ).toThrow(
      'Lesson path local-wrap-study step 1 references an unknown gallery example: "missing".',
    );
  });

  it("rejects invalid rules, seeds, and boundary values", () => {
    const invalidRule = JSON.parse(validPackJson);
    invalidRule.lessonPaths[0].steps[0].settings.rule = 300;

    expect(() => importLessonPathPack(JSON.stringify(invalidRule))).toThrow(
      "Lesson path local-wrap-study step 1 rule must be an integer from 0 to 255.",
    );

    const invalidSeed = JSON.parse(validPackJson);
    invalidSeed.lessonPaths[0].steps[0].settings.seedMode = "coin";

    expect(() => importLessonPathPack(JSON.stringify(invalidSeed))).toThrow(
      "Lesson path local-wrap-study step 1 seedMode must be center, random, or custom.",
    );

    const invalidBoundary = JSON.parse(validPackJson);
    invalidBoundary.lessonPaths[0].steps[0].settings.boundaryMode = "mirror";

    expect(() => importLessonPathPack(JSON.stringify(invalidBoundary))).toThrow(
      "Lesson path local-wrap-study step 1 boundaryMode must be fixed or wrap.",
    );
  });
});
