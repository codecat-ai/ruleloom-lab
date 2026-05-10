import { describe, expect, it } from "vitest";
import { exportPatternRle } from "./rleExport";
import { parseRuleloomRle } from "./rleImport";

describe("Ruleloom RLE import", () => {
  it("restores editable custom settings from a deterministic export", () => {
    const rle = exportPatternRle(
      [
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1]
      ],
      {
        rule: 90,
        width: 5,
        seedMode: "center",
        boundaryMode: "fixed"
      }
    );

    expect(parseRuleloomRle(rle)).toEqual({
      rule: 90,
      width: 15,
      generations: 3,
      seedMode: "custom",
      boundaryMode: "fixed",
      customSeed: "00100"
    });
  });

  it("prefers custom seed metadata over the first decoded row", () => {
    const rle = `# Ruleloom Lab
# rule: 184
# width: 15
# generations: 1
# seed mode: custom
# boundary mode: wrap
# custom seed: 101
x = 15, y = 1, rule = W184
15b!`;

    expect(parseRuleloomRle(rle)).toMatchObject({
      rule: 184,
      width: 15,
      generations: 1,
      seedMode: "custom",
      boundaryMode: "wrap",
      customSeed: "101"
    });
  });

  it("decodes numeric runs and row separators", () => {
    expect(
      parseRuleloomRle(`x = 15, y = 2, rule = W30
3o2bo9b$bobo11b!`)
    ).toMatchObject({
      customSeed: "111001000000000",
      generations: 2,
      rule: 30,
      width: 15
    });
  });

  it("reports helpful validation errors", () => {
    expect(() => parseRuleloomRle("3o!")).toThrow(/missing header/i);
    expect(() =>
      parseRuleloomRle(`x = 15, y = 1, rule = B3/S23
15b!`)
    ).toThrow(/unsupported rule marker/i);
    expect(() =>
      parseRuleloomRle(`x = 15, y = 1, rule = W90
2!`)
    ).toThrow(/malformed run/i);
    expect(() =>
      parseRuleloomRle(`x = 15, y = 1, rule = W90
14b!`)
    ).toThrow(/width mismatch/i);
    expect(() =>
      parseRuleloomRle(`x = 15, y = 1, rule = W90
!`)
    ).toThrow(/empty body/i);
  });
});
