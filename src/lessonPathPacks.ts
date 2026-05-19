import {
  type AutomatonSettings,
  MAX_GENERATIONS,
  MAX_WIDTH,
  MIN_GENERATIONS,
  MIN_WIDTH,
} from "./automata";
import { getGalleryExampleById } from "./gallery";
import type { LessonPath, LessonPathStep } from "./lessonPaths";

export const LESSON_PATH_PACK_SCHEMA_VERSION = 1;

interface LessonPathPack {
  schemaVersion: typeof LESSON_PATH_PACK_SCHEMA_VERSION;
  lessonPaths: LessonPath[];
}

export function exportLessonPathPack(paths: readonly LessonPath[]): string {
  return JSON.stringify(
    {
      schemaVersion: LESSON_PATH_PACK_SCHEMA_VERSION,
      lessonPaths: paths.map(copyLessonPath),
    } satisfies LessonPathPack,
    null,
    2,
  );
}

export function importLessonPathPack(json: string): LessonPath[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Lesson path pack import failed: paste valid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Lesson path pack must be a JSON object.");
  }

  const schemaVersion = parsed.schemaVersion;
  if (schemaVersion !== LESSON_PATH_PACK_SCHEMA_VERSION) {
    throw new Error(
      `Lesson path pack schema version ${String(schemaVersion)} is not supported.`,
    );
  }

  if (!Array.isArray(parsed.lessonPaths)) {
    throw new Error("Lesson path pack needs a lessonPaths array.");
  }

  const seenIds = new Set<string>();
  return parsed.lessonPaths.map((path, index) => {
    const importedPath = validateLessonPath(path, index);

    if (seenIds.has(importedPath.id)) {
      throw new Error(
        `Lesson path pack has a duplicate path id: "${importedPath.id}".`,
      );
    }

    seenIds.add(importedPath.id);
    return importedPath;
  });
}

function validateLessonPath(value: unknown, index: number): LessonPath {
  const ordinal = index + 1;

  if (!isRecord(value)) {
    throw new Error(`Lesson path ${ordinal} must be an object.`);
  }

  const id = validateSafeId(value.id, `Lesson path ${ordinal}`);
  const title = validateNonEmptyString(
    value.title,
    `Lesson path ${id} needs a non-empty title.`,
  );
  const summary = validateNonEmptyString(
    value.summary,
    `Lesson path ${id} needs a non-empty summary.`,
  );
  const audience = validateNonEmptyString(
    value.audience,
    `Lesson path ${id} needs a non-empty audience.`,
  );
  const estimatedMinutes = validateInteger(
    value.estimatedMinutes,
    `Lesson path ${id} estimatedMinutes`,
    1,
    240,
  );

  if (!Array.isArray(value.steps) || value.steps.length === 0) {
    throw new Error(`Lesson path ${id} needs at least one step.`);
  }

  return {
    id,
    title,
    summary,
    estimatedMinutes,
    audience,
    steps: value.steps.map((step, stepIndex) =>
      validateLessonPathStep(step, id, stepIndex),
    ),
  };
}

function validateLessonPathStep(
  value: unknown,
  pathId: string,
  index: number,
): LessonPathStep {
  const label = `Lesson path ${pathId} step ${index + 1}`;

  if (!isRecord(value)) {
    throw new Error(`${label} must be an object.`);
  }

  const prompt = validateNonEmptyString(
    value.prompt,
    `${label} needs a non-empty prompt.`,
  );
  const galleryExampleId =
    value.galleryExampleId === undefined
      ? undefined
      : validateSafeId(value.galleryExampleId, `${label} galleryExampleId`);

  if (galleryExampleId && !getGalleryExampleById(galleryExampleId)) {
    throw new Error(
      `${label} references an unknown gallery example: "${galleryExampleId}".`,
    );
  }

  const hasSettings = value.settings !== undefined;

  if (!galleryExampleId && !hasSettings) {
    throw new Error(
      `${label} needs either a galleryExampleId or local settings.`,
    );
  }

  const settings = hasSettings
    ? validateAutomatonSettings(value.settings, label)
    : undefined;
  const comparisonRule =
    value.comparisonRule === undefined
      ? settings?.rule
      : validateInteger(
          value.comparisonRule,
          `${label} comparisonRule`,
          0,
          255,
        );

  return {
    ...(galleryExampleId ? { galleryExampleId } : {}),
    prompt,
    ...(settings ? { settings } : {}),
    ...(comparisonRule !== undefined ? { comparisonRule } : {}),
  };
}

function validateAutomatonSettings(
  value: unknown,
  label: string,
): AutomatonSettings {
  if (!isRecord(value)) {
    throw new Error(`${label} settings must be an object.`);
  }

  const rule = validateInteger(value.rule, `${label} rule`, 0, 255);
  const width = validateInteger(
    value.width,
    `${label} width`,
    MIN_WIDTH,
    MAX_WIDTH,
  );
  const generations = validateInteger(
    value.generations,
    `${label} generations`,
    MIN_GENERATIONS,
    MAX_GENERATIONS,
  );
  const seedMode = validateSeedMode(value.seedMode, label);
  const boundaryMode = validateBoundaryMode(value.boundaryMode, label);
  const randomSeed =
    value.randomSeed === undefined
      ? 1
      : validateInteger(value.randomSeed, `${label} randomSeed`, 0, 999999999);
  const customSeed =
    value.customSeed === undefined
      ? ""
      : validateCustomSeed(value.customSeed, label);

  if (seedMode === "custom" && customSeed.length === 0) {
    throw new Error(`${label} customSeed needs at least one 0 or 1 bit.`);
  }

  return {
    rule,
    width,
    generations,
    seedMode,
    boundaryMode,
    randomSeed,
    customSeed,
  };
}

function validateSafeId(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(value)) {
    throw new Error(
      `${label} needs a safe id using letters, numbers, and hyphens.`,
    );
  }

  return value;
}

function validateNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(label);
  }

  return value.trim();
}

function validateInteger(
  value: unknown,
  label: string,
  min: number,
  max: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(`${label} must be an integer from ${min} to ${max}.`);
  }

  return value;
}

function validateSeedMode(
  value: unknown,
  label: string,
): AutomatonSettings["seedMode"] {
  if (value !== "center" && value !== "random" && value !== "custom") {
    throw new Error(`${label} seedMode must be center, random, or custom.`);
  }

  return value;
}

function validateBoundaryMode(
  value: unknown,
  label: string,
): NonNullable<AutomatonSettings["boundaryMode"]> {
  if (value !== "fixed" && value !== "wrap") {
    throw new Error(`${label} boundaryMode must be fixed or wrap.`);
  }

  return value;
}

function validateCustomSeed(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[01]*$/.test(value)) {
    throw new Error(`${label} customSeed must contain only 0 and 1 bits.`);
  }

  return value;
}

function copyLessonPath(path: LessonPath): LessonPath {
  return {
    ...path,
    steps: path.steps.map((step) => ({
      ...step,
      settings: step.settings ? { ...step.settings } : undefined,
    })),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
