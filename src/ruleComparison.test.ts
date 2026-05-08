import { describe, expect, it } from "vitest";
import { compareRules } from "./ruleComparison";

describe("rule comparison", () => {
  it("reports no divergence or differing cells for identical rules", () => {
    expect(
      compareRules({
        primaryRule: 90,
        comparisonRule: 90,
        width: 15,
        steps: 5,
        seed: "center",
        wrap: false
      })
    ).toMatchObject({
      firstDifferingGeneration: null,
      totalDifferingCells: 0,
      differingCellsByGeneration: [0, 0, 0, 0, 0]
    });
  });

  it("finds a known first differing generation and per-generation counts", () => {
    const comparison = compareRules({
      primaryRule: 30,
      comparisonRule: 90,
      width: 15,
      steps: 5,
      seed: "center",
      wrap: false
    });

    expect(comparison.firstDifferingGeneration).toBe(1);
    expect(comparison.differingCellsByGeneration).toEqual([0, 1, 1, 4, 2]);
    expect(comparison.totalDifferingCells).toBe(8);
    expect(comparison.primaryRows[1]).toEqual([0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]);
    expect(comparison.comparisonRows[1]).toEqual([0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0]);
  });

  it("uses wrap mode when comparing edge-sensitive seeds", () => {
    const baseOptions = {
      primaryRule: 30,
      comparisonRule: 90,
      width: 15,
      steps: 5,
      seed: { mode: "custom" as const, customSeed: "100000000000000" }
    };

    expect(compareRules({ ...baseOptions, wrap: false }).differingCellsByGeneration).toEqual([
      0, 1, 0, 2, 1
    ]);
    expect(compareRules({ ...baseOptions, wrap: true }).differingCellsByGeneration).toEqual([
      0, 1, 1, 4, 2
    ]);
  });

  it("rejects invalid rule, width, and step values", () => {
    const validOptions = {
      primaryRule: 30,
      comparisonRule: 90,
      width: 15,
      steps: 5,
      seed: "center" as const,
      wrap: false
    };

    expect(() => compareRules({ ...validOptions, primaryRule: -1 })).toThrow(RangeError);
    expect(() => compareRules({ ...validOptions, comparisonRule: 256 })).toThrow(RangeError);
    expect(() => compareRules({ ...validOptions, width: 14 })).toThrow(RangeError);
    expect(() => compareRules({ ...validOptions, steps: 0 })).toThrow(RangeError);
    expect(() => compareRules({ ...validOptions, steps: 1.5 })).toThrow(RangeError);
  });
});
