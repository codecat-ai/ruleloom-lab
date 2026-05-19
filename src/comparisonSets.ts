import {
  type AutomatonSettings,
  type BoundaryMode,
  type SeedMode,
  MAX_GENERATIONS,
  MAX_WIDTH,
  MIN_GENERATIONS,
  MIN_WIDTH,
} from "./automata";

export const COMPARISON_SET_SCHEMA_VERSION = 1;
export const COMPARISON_SET_STORAGE_KEY = "ruleloom.comparisonSets.v1";
export const MAX_COMPARISON_SET_TITLE_LENGTH = 80;
export const MAX_COMPARISON_SET_NOTE_LENGTH = 500;

export interface ComparisonSetStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export interface SavedComparisonSet {
  schemaVersion: typeof COMPARISON_SET_SCHEMA_VERSION;
  id: string;
  title: string;
  note?: string;
  primaryRule: number;
  comparisonRule: number;
  width: number;
  generations: number;
  seedMode: SeedMode;
  boundaryMode: BoundaryMode;
  randomSeed: number;
  customSeed: string;
  createdAt: string;
}

export type ComparisonSetSettings = AutomatonSettings & {
  comparisonRule: number;
};

export interface ComparisonSetDraft {
  title: string;
  note?: string;
}

export interface ComparisonSetCreateOptions {
  createId?: () => string;
  now?: () => string;
}

interface ComparisonSetExport {
  schemaVersion: typeof COMPARISON_SET_SCHEMA_VERSION;
  comparisonSets: SavedComparisonSet[];
}

export function createComparisonSetFromSettings(
  settings: ComparisonSetSettings,
  draft: ComparisonSetDraft,
  options: ComparisonSetCreateOptions = {},
): SavedComparisonSet {
  const id = validateSafeId(options.createId?.() ?? crypto.randomUUID(), "id");
  const createdAt = validateIsoString(
    options.now?.() ?? new Date().toISOString(),
    "createdAt",
  );
  const title = validateBoundedRequiredString(
    draft.title,
    "title",
    MAX_COMPARISON_SET_TITLE_LENGTH,
  );
  const note = normalizeOptionalBoundedString(
    draft.note,
    "note",
    MAX_COMPARISON_SET_NOTE_LENGTH,
  );

  return {
    schemaVersion: COMPARISON_SET_SCHEMA_VERSION,
    id,
    title,
    ...(note ? { note } : {}),
    primaryRule: validateInteger(settings.rule, "primaryRule", 0, 255),
    comparisonRule: validateInteger(
      settings.comparisonRule,
      "comparisonRule",
      0,
      255,
    ),
    width: validateInteger(settings.width, "width", MIN_WIDTH, MAX_WIDTH),
    generations: validateInteger(
      settings.generations,
      "generations",
      MIN_GENERATIONS,
      MAX_GENERATIONS,
    ),
    seedMode: validateSeedMode(settings.seedMode, "seedMode"),
    boundaryMode: validateBoundaryMode(settings.boundaryMode, "boundaryMode"),
    randomSeed:
      settings.randomSeed === undefined
        ? 1
        : validateInteger(settings.randomSeed, "randomSeed", 0, 999999999),
    customSeed:
      settings.customSeed === undefined
        ? ""
        : validateCustomSeed(settings.customSeed, "customSeed"),
    createdAt,
  };
}

export function listComparisonSets(
  storage: ComparisonSetStorage,
  key = COMPARISON_SET_STORAGE_KEY,
): SavedComparisonSet[] {
  return sortComparisonSets(readComparisonSets(storage, key)).map(copySet);
}

export function saveComparisonSet(
  storage: ComparisonSetStorage,
  set: SavedComparisonSet,
  key = COMPARISON_SET_STORAGE_KEY,
): SavedComparisonSet[] {
  const validated = validateComparisonSet(set, "comparisonSets[0]");
  const existing = readComparisonSets(storage, key).filter(
    (candidate) => candidate.id !== validated.id,
  );
  const next = sortComparisonSets([...existing, validated]);
  writeComparisonSets(storage, next, key);
  return next.map(copySet);
}

export function removeComparisonSet(
  storage: ComparisonSetStorage,
  id: string,
  key = COMPARISON_SET_STORAGE_KEY,
): SavedComparisonSet[] {
  const next = readComparisonSets(storage, key).filter((set) => set.id !== id);
  writeComparisonSets(storage, next, key);
  return sortComparisonSets(next).map(copySet);
}

export function exportComparisonSetsJson(
  storage: ComparisonSetStorage,
  key = COMPARISON_SET_STORAGE_KEY,
): string {
  return serializeComparisonSets(listComparisonSets(storage, key));
}

export function importComparisonSetsJson(
  storage: ComparisonSetStorage,
  json: string,
  key = COMPARISON_SET_STORAGE_KEY,
): SavedComparisonSet[] {
  const imported = parseComparisonSetsJson(json);
  writeComparisonSets(storage, imported, key);
  return imported.map(copySet);
}

export function savedComparisonSetToSettings(
  set: SavedComparisonSet,
): ComparisonSetSettings {
  const validated = validateComparisonSet(set, "comparisonSet");

  return {
    rule: validated.primaryRule,
    comparisonRule: validated.comparisonRule,
    width: validated.width,
    generations: validated.generations,
    seedMode: validated.seedMode,
    boundaryMode: validated.boundaryMode,
    randomSeed: validated.randomSeed,
    customSeed: validated.customSeed,
  };
}

export function parseComparisonSetsJson(json: string): SavedComparisonSet[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Comparison set JSON is not valid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Comparison set JSON must be an object.");
  }

  if (parsed.schemaVersion !== COMPARISON_SET_SCHEMA_VERSION) {
    throw new Error("Comparison set JSON schemaVersion must be 1.");
  }

  if (!Array.isArray(parsed.comparisonSets)) {
    throw new Error("Comparison set JSON needs a comparisonSets array.");
  }

  const seenIds = new Set<string>();
  const sets = parsed.comparisonSets.map((set, index) => {
    const validated = validateComparisonSet(set, `comparisonSets[${index}]`);

    if (seenIds.has(validated.id)) {
      throw new Error(
        `comparisonSets[${index}].id duplicates "${validated.id}".`,
      );
    }

    seenIds.add(validated.id);
    return validated;
  });

  return sortComparisonSets(sets);
}

function readComparisonSets(
  storage: ComparisonSetStorage,
  key: string,
): SavedComparisonSet[] {
  const stored = storage.getItem(key);

  if (!stored) {
    return [];
  }

  return parseComparisonSetsJson(stored);
}

function writeComparisonSets(
  storage: ComparisonSetStorage,
  sets: readonly SavedComparisonSet[],
  key: string,
): void {
  if (sets.length === 0) {
    storage.removeItem(key);
    return;
  }

  storage.setItem(key, serializeComparisonSets(sets));
}

function serializeComparisonSets(sets: readonly SavedComparisonSet[]): string {
  return JSON.stringify(
    {
      schemaVersion: COMPARISON_SET_SCHEMA_VERSION,
      comparisonSets: sortComparisonSets(sets).map(copySet),
    } satisfies ComparisonSetExport,
    null,
    2,
  );
}

function validateComparisonSet(
  value: unknown,
  label: string,
): SavedComparisonSet {
  if (!isRecord(value)) {
    throw new Error(`${label} must be an object.`);
  }

  if (value.schemaVersion !== COMPARISON_SET_SCHEMA_VERSION) {
    throw new Error(`${label}.schemaVersion must be 1.`);
  }

  const note = normalizeOptionalBoundedString(
    value.note,
    `${label}.note`,
    MAX_COMPARISON_SET_NOTE_LENGTH,
  );

  return {
    schemaVersion: COMPARISON_SET_SCHEMA_VERSION,
    id: validateSafeId(value.id, `${label}.id`),
    title: validateBoundedRequiredString(
      value.title,
      `${label}.title`,
      MAX_COMPARISON_SET_TITLE_LENGTH,
    ),
    ...(note ? { note } : {}),
    primaryRule: validateInteger(
      value.primaryRule,
      `${label}.primaryRule`,
      0,
      255,
    ),
    comparisonRule: validateInteger(
      value.comparisonRule,
      `${label}.comparisonRule`,
      0,
      255,
    ),
    width: validateInteger(value.width, `${label}.width`, MIN_WIDTH, MAX_WIDTH),
    generations: validateInteger(
      value.generations,
      `${label}.generations`,
      MIN_GENERATIONS,
      MAX_GENERATIONS,
    ),
    seedMode: validateSeedMode(value.seedMode, `${label}.seedMode`),
    boundaryMode: validateBoundaryMode(
      value.boundaryMode,
      `${label}.boundaryMode`,
    ),
    randomSeed:
      value.randomSeed === undefined
        ? 1
        : validateInteger(
            value.randomSeed,
            `${label}.randomSeed`,
            0,
            999999999,
          ),
    customSeed:
      value.customSeed === undefined
        ? ""
        : validateCustomSeed(value.customSeed, `${label}.customSeed`),
    createdAt: validateIsoString(value.createdAt, `${label}.createdAt`),
  };
}

function sortComparisonSets(
  sets: readonly SavedComparisonSet[],
): SavedComparisonSet[] {
  return [...sets].sort((left, right) => {
    return (
      left.title.localeCompare(right.title) ||
      left.createdAt.localeCompare(right.createdAt) ||
      left.id.localeCompare(right.id)
    );
  });
}

function copySet(set: SavedComparisonSet): SavedComparisonSet {
  return { ...set };
}

function validateSafeId(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value)) {
    throw new Error(`${label} needs a safe id.`);
  }

  return value;
}

function validateBoundedRequiredString(
  value: unknown,
  label: string,
  maxLength: number,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} is required.`);
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }

  return trimmed;
}

function normalizeOptionalBoundedString(
  value: unknown,
  label: string,
  maxLength: number,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${label} must be a string when provided.`);
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }

  return trimmed.length > 0 ? trimmed : undefined;
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

function validateSeedMode(value: unknown, label: string): SeedMode {
  if (value !== "center" && value !== "random" && value !== "custom") {
    throw new Error(`${label} must be center, random, or custom.`);
  }

  return value;
}

function validateBoundaryMode(value: unknown, label: string): BoundaryMode {
  if (value !== "fixed" && value !== "wrap") {
    throw new Error(`${label} must be fixed or wrap.`);
  }

  return value;
}

function validateCustomSeed(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[01]*$/.test(value)) {
    throw new Error(`${label} must contain only 0 and 1 bits.`);
  }

  return value;
}

function validateIsoString(value: unknown, label: string): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be an ISO date string.`);
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
