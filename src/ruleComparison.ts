import {
  type Bit,
  type BoundaryMode,
  type SeedMode,
  generateAutomaton,
  MAX_GENERATIONS,
  MAX_WIDTH,
  MIN_GENERATIONS,
  MIN_WIDTH
} from "./automata";

export type RuleComparisonSeed =
  | SeedMode
  | {
      mode: SeedMode;
      randomSeed?: number;
      customSeed?: string;
    };

export interface RuleComparisonOptions {
  primaryRule: number;
  comparisonRule: number;
  width: number;
  steps: number;
  seed: RuleComparisonSeed;
  wrap: boolean;
}

export interface RuleComparisonResult {
  primaryRows: Bit[][];
  comparisonRows: Bit[][];
  firstDifferingGeneration: number | null;
  totalDifferingCells: number;
  differingCellsByGeneration: number[];
}

export function compareRules(options: RuleComparisonOptions): RuleComparisonResult {
  assertIntegerInRange("primaryRule", options.primaryRule, 0, 255);
  assertIntegerInRange("comparisonRule", options.comparisonRule, 0, 255);
  assertIntegerInRange("width", options.width, MIN_WIDTH, MAX_WIDTH);
  assertIntegerInRange("steps", options.steps, MIN_GENERATIONS, MAX_GENERATIONS);

  const seed = normalizeSeed(options.seed);
  const boundaryMode: BoundaryMode = options.wrap ? "wrap" : "fixed";
  const sharedSettings = {
    width: options.width,
    generations: options.steps,
    seedMode: seed.mode,
    boundaryMode,
    randomSeed: seed.randomSeed,
    customSeed: seed.customSeed
  };

  const primaryRows = generateAutomaton({ ...sharedSettings, rule: options.primaryRule });
  const comparisonRows = generateAutomaton({ ...sharedSettings, rule: options.comparisonRule });
  const differingCellsByGeneration = primaryRows.map((row, rowIndex) => countDifferingCells(row, comparisonRows[rowIndex]));
  const firstDifferingGeneration = differingCellsByGeneration.findIndex((count) => count > 0);

  return {
    primaryRows,
    comparisonRows,
    firstDifferingGeneration: firstDifferingGeneration === -1 ? null : firstDifferingGeneration,
    totalDifferingCells: differingCellsByGeneration.reduce((total, count) => total + count, 0),
    differingCellsByGeneration
  };
}

function normalizeSeed(seed: RuleComparisonSeed): { mode: SeedMode; randomSeed?: number; customSeed?: string } {
  if (typeof seed === "string") {
    assertSeedMode(seed);
    return { mode: seed };
  }

  assertSeedMode(seed.mode);
  return {
    mode: seed.mode,
    randomSeed: seed.randomSeed,
    customSeed: seed.customSeed
  };
}

function countDifferingCells(primaryRow: Bit[], comparisonRow: Bit[]): number {
  return primaryRow.reduce((count, bit, index) => count + (bit === comparisonRow[index] ? 0 : 1), 0);
}

function assertIntegerInRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be an integer from ${min} to ${max}.`);
  }
}

function assertSeedMode(value: SeedMode): void {
  if (value !== "center" && value !== "random" && value !== "custom") {
    throw new RangeError("seed mode must be center, random, or custom.");
  }
}
