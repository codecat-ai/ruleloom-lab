import { describe, expect, it } from "vitest";
import { exportPatternRle } from "./rleExport";
import { type Bit } from "./automata";

describe("RLE-like pattern export", () => {
  it("compresses repeated cells and omits single run counts", () => {
    const rows: Bit[][] = [
      [1, 1, 1, 0, 0, 1],
      [0, 1, 0, 0, 0, 1]
    ];

    const rle = exportPatternRle(rows, {
      rule: 30,
      width: 6,
      seedMode: "center",
      boundaryMode: "fixed"
    });

    expect(rle).toBe(`# Ruleloom Lab
# rule: 30
# width: 6
# generations: 2
# seed mode: center
# boundary mode: fixed
x = 6, y = 2, rule = W30
3o2bo$bo3bo!`);
  });

  it("includes deterministic random and custom seed metadata only when relevant", () => {
    const randomRle = exportPatternRle([[1, 0, 0]], {
      rule: 90,
      width: 3,
      seedMode: "random",
      randomSeed: 42,
      boundaryMode: "wrap"
    });

    expect(randomRle).toContain("# seed mode: random");
    expect(randomRle).toContain("# random seed: 42");
    expect(randomRle).toContain("# boundary mode: wrap");

    const customRle = exportPatternRle([[1, 0, 1]], {
      rule: 184,
      width: 3,
      seedMode: "custom",
      customSeed: "101",
      boundaryMode: "fixed"
    });

    expect(customRle).toContain("# seed mode: custom");
    expect(customRle).toContain("# custom seed: 101");
    expect(customRle).not.toContain("# random seed:");
  });

  it("exports empty input with a valid header and terminator", () => {
    const rle = exportPatternRle([], {
      rule: 110,
      width: 0,
      seedMode: "center",
      boundaryMode: "fixed"
    });

    expect(rle).toBe(`# Ruleloom Lab
# rule: 110
# width: 0
# generations: 0
# seed mode: center
# boundary mode: fixed
x = 0, y = 0, rule = W110
!`);
  });
});
