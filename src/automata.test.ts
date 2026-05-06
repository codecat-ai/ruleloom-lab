import { describe, expect, it } from "vitest";
import {
  clampSettings,
  decodeRule,
  generateAutomaton,
  nextGeneration,
  seedGeneration
} from "./automata";

describe("automata engine", () => {
  it("decodes rule 30 for neighborhoods 111 through 000", () => {
    expect(decodeRule(30)).toEqual({
      "111": 0,
      "110": 0,
      "101": 0,
      "100": 1,
      "011": 1,
      "010": 1,
      "001": 1,
      "000": 0
    });
  });

  it("uses zero boundary cells for the next generation", () => {
    expect(nextGeneration([1, 0, 0], decodeRule(30))).toEqual([1, 1, 0]);
  });

  it("can wrap boundary cells for the next generation", () => {
    expect(nextGeneration([1, 0, 0], decodeRule(30), "wrap")).toEqual([1, 1, 1]);
  });

  it("generates wrapped rows when boundary mode is wrap", () => {
    expect(
      generateAutomaton({
        rule: 30,
        width: 15,
        generations: 3,
        seedMode: "custom",
        customSeed: "100000000000000",
        boundaryMode: "wrap"
      })
    ).toEqual([
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]
    ]);
  });

  it("generates known first rows for rule 30 from a center seed", () => {
    expect(
      generateAutomaton({
        rule: 30,
        width: 15,
        generations: 5,
        seedMode: "center"
      })
    ).toEqual([
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]
    ]);
  });

  it("keeps rule 90 symmetric from a center seed", () => {
    const rows = generateAutomaton({
      rule: 90,
      width: 9,
      generations: 6,
      seedMode: "center"
    });

    for (const row of rows) {
      expect(row).toEqual([...row].reverse());
    }
  });

  it("creates deterministic random seeds from the same numeric seed", () => {
    expect(seedGeneration({ width: 21, seedMode: "random", randomSeed: 42 })).toEqual(
      seedGeneration({ width: 21, seedMode: "random", randomSeed: 42 })
    );
  });

  it("pads and trims custom bit strings", () => {
    expect(seedGeneration({ width: 6, seedMode: "custom", customSeed: "101" })).toEqual([
      1, 0, 1, 0, 0, 0
    ]);
    expect(seedGeneration({ width: 4, seedMode: "custom", customSeed: "110011" })).toEqual([
      1, 1, 0, 0
    ]);
  });

  it("clamps UI settings predictably", () => {
    expect(
      clampSettings({
        rule: 300,
        width: 200,
        generations: -10,
        seedMode: "center",
        boundaryMode: "invalid" as never
      })
    ).toMatchObject({ rule: 255, width: 121, generations: 1, boundaryMode: "fixed" });
  });
});
