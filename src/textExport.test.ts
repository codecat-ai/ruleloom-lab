import { describe, expect, it } from "vitest";
import { exportPatternText } from "./textExport";

describe("plain-text pattern export", () => {
  it("exports portable metadata and monospaced rows with default glyphs", () => {
    const text = exportPatternText({
      rule: 90,
      width: 15,
      generations: 3,
      seedMode: "center",
      boundaryMode: "fixed"
    });

    expect(text).toMatchInlineSnapshot(`
      "# Ruleloom Lab pattern
      rule: 90
      width: 15
      generations: 3
      seed: center
      boundary: fixed

      .......#.......
      ......#.#......
      .....#...#....."
    `);
  });

  it("exports deterministic random seed and custom alive/dead glyphs", () => {
    const text = exportPatternText(
      {
        rule: 30,
        width: 15,
        generations: 2,
        seedMode: "random",
        randomSeed: 42,
        boundaryMode: "wrap"
      },
      {
        aliveGlyph: "X",
        deadGlyph: "-"
      }
    );

    expect(text).toMatchInlineSnapshot(`
      "# Ruleloom Lab pattern
      rule: 30
      width: 15
      generations: 2
      seed: random 42
      boundary: wrap

      X-XX-X-XX--XX--
      X-X--X-X-XXX-XX"
    `);
  });

  it("describes custom seeds in metadata without widening exported rows", () => {
    const text = exportPatternText({
      rule: 184,
      width: 15,
      generations: 1,
      seedMode: "custom",
      customSeed: "101",
      boundaryMode: "fixed"
    });

    expect(text).toBe(`# Ruleloom Lab pattern
rule: 184
width: 15
generations: 1
seed: custom 101
boundary: fixed

#.#............`);
  });
});
