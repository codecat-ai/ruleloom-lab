import { type AutomatonSettings, type BoundaryMode, clampSettings, type SeedMode } from "./automata";

export const DEFAULT_SETTINGS: AutomatonSettings = {
  rule: 30,
  width: 61,
  generations: 80,
  seedMode: "center",
  boundaryMode: "fixed",
  randomSeed: 1,
  customSeed: ""
};

export function parseSettingsQuery(query: string): AutomatonSettings {
  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  const seedMode = parseSeedMode(params.get("seed")) ?? DEFAULT_SETTINGS.seedMode;
  const boundaryMode = parseBoundaryMode(params.get("boundary")) ?? DEFAULT_SETTINGS.boundaryMode;

  return clampSettings({
    rule: parseNumber(params.get("rule"), DEFAULT_SETTINGS.rule),
    width: parseNumber(params.get("width"), DEFAULT_SETTINGS.width),
    generations: parseNumber(params.get("steps"), DEFAULT_SETTINGS.generations),
    seedMode,
    boundaryMode,
    randomSeed: parseNumber(params.get("randomSeed"), DEFAULT_SETTINGS.randomSeed ?? 1),
    customSeed: params.get("customSeed") ?? DEFAULT_SETTINGS.customSeed
  });
}

export function serializeSettingsQuery(settings: AutomatonSettings): string {
  const normalized = clampSettings(settings);
  const params = new URLSearchParams();
  params.set("rule", String(normalized.rule));
  params.set("width", String(normalized.width));
  params.set("steps", String(normalized.generations));
  params.set("seed", normalized.seedMode);
  params.set("boundary", normalized.boundaryMode ?? DEFAULT_SETTINGS.boundaryMode ?? "fixed");

  if (normalized.seedMode === "random" || settings.randomSeed !== undefined) {
    params.set("randomSeed", String(settings.randomSeed ?? DEFAULT_SETTINGS.randomSeed));
  }

  if (normalized.seedMode === "custom" || settings.customSeed) {
    params.set("customSeed", settings.customSeed ?? "");
  }

  return `?${params.toString()}`;
}

function parseNumber(value: string | null, fallback: number): number {
  if (value === null || value.trim() === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseSeedMode(value: string | null): SeedMode | undefined {
  if (value === "center" || value === "random" || value === "custom") {
    return value;
  }
  return undefined;
}

function parseBoundaryMode(value: string | null): BoundaryMode | undefined {
  if (value === "fixed" || value === "wrap") {
    return value;
  }
  return undefined;
}
