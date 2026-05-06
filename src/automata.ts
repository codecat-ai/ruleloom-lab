export type Bit = 0 | 1;
export type SeedMode = "center" | "random" | "custom";
export type BoundaryMode = "fixed" | "wrap";

export type RuleTable = Record<string, Bit>;

export interface AutomatonSettings {
  rule: number;
  width: number;
  generations: number;
  seedMode: SeedMode;
  boundaryMode?: BoundaryMode;
  randomSeed?: number;
  customSeed?: string;
}

export interface SeedOptions {
  width: number;
  seedMode: SeedMode;
  randomSeed?: number;
  customSeed?: string;
}

export const MIN_WIDTH = 15;
export const MAX_WIDTH = 121;
export const MIN_GENERATIONS = 1;
export const MAX_GENERATIONS = 160;

const NEIGHBORHOODS = ["111", "110", "101", "100", "011", "010", "001", "000"] as const;

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

export function clampSettings(settings: AutomatonSettings): AutomatonSettings {
  const seedMode = isSeedMode(settings.seedMode) ? settings.seedMode : "center";
  const boundaryMode = isBoundaryMode(settings.boundaryMode) ? settings.boundaryMode : "fixed";

  return {
    rule: clamp(settings.rule, 0, 255),
    width: clamp(settings.width, MIN_WIDTH, MAX_WIDTH),
    generations: clamp(settings.generations, MIN_GENERATIONS, MAX_GENERATIONS),
    seedMode,
    boundaryMode,
    randomSeed: settings.randomSeed,
    customSeed: settings.customSeed
  };
}

export function decodeRule(rule: number): RuleTable {
  const normalized = clamp(rule, 0, 255);
  return Object.fromEntries(
    NEIGHBORHOODS.map((neighborhood) => {
      const index = Number.parseInt(neighborhood, 2);
      return [neighborhood, ((normalized >> index) & 1) as Bit];
    })
  ) as RuleTable;
}

export function nextGeneration(row: Bit[], ruleTable: RuleTable, boundaryMode: BoundaryMode = "fixed"): Bit[] {
  return row.map((_, index) => {
    const left = boundaryMode === "wrap" ? row[(index - 1 + row.length) % row.length] : (row[index - 1] ?? 0);
    const center = row[index] ?? 0;
    const right = boundaryMode === "wrap" ? row[(index + 1) % row.length] : (row[index + 1] ?? 0);
    return ruleTable[`${left}${center}${right}`] ?? 0;
  });
}

export function seedGeneration(options: SeedOptions): Bit[] {
  const width = clamp(options.width, 1, MAX_WIDTH);

  if (options.seedMode === "custom") {
    return Array.from({ length: width }, (_, index) => (options.customSeed?.[index] === "1" ? 1 : 0));
  }

  if (options.seedMode === "random") {
    const random = mulberry32(options.randomSeed ?? 1);
    return Array.from({ length: width }, () => (random() >= 0.5 ? 1 : 0));
  }

  return Array.from({ length: width }, (_, index) => (index === Math.floor(width / 2) ? 1 : 0));
}

export function generateAutomaton(settings: AutomatonSettings): Bit[][] {
  const normalized = clampSettings(settings);
  const ruleTable = decodeRule(normalized.rule);
  const rows: Bit[][] = [
    seedGeneration({
      width: normalized.width,
      seedMode: normalized.seedMode,
      randomSeed: normalized.randomSeed,
      customSeed: normalized.customSeed
    })
  ];

  while (rows.length < normalized.generations) {
    rows.push(nextGeneration(rows[rows.length - 1], ruleTable, normalized.boundaryMode));
  }

  return rows;
}

export function neighborhoods(): readonly string[] {
  return NEIGHBORHOODS;
}

function isSeedMode(value: string): value is SeedMode {
  return value === "center" || value === "random" || value === "custom";
}

function isBoundaryMode(value: string | undefined): value is BoundaryMode {
  return value === "fixed" || value === "wrap";
}

function mulberry32(seed: number): () => number {
  let state = Math.trunc(seed) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}
