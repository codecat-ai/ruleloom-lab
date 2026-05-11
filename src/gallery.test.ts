import { describe, expect, it } from "vitest";
import {
  applyGalleryExample,
  GALLERY_EXAMPLES,
  getGalleryExampleById,
} from "./gallery";
import { serializeSettingsQuery } from "./share";

describe("gallery examples", () => {
  it("defines four stable curated examples", () => {
    expect(GALLERY_EXAMPLES).toHaveLength(4);
    expect(GALLERY_EXAMPLES.map((example) => example.id)).toEqual([
      "sierpinski-center",
      "wrapped-traffic-loop",
      "rule-30-random-field",
      "custom-seed-glider-lanes",
    ]);
  });

  it("includes wrapped-boundary and custom-seed examples", () => {
    expect(
      GALLERY_EXAMPLES.some(
        (example) => example.settings.boundaryMode === "wrap",
      ),
    ).toBe(true);
    expect(
      GALLERY_EXAMPLES.some((example) => example.settings.seedMode === "custom"),
    ).toBe(true);
  });

  it("exposes settings that serialize through share helpers", () => {
    const wrapped = getGalleryExampleById("wrapped-traffic-loop");

    expect(wrapped?.settings).toMatchObject({
      rule: 184,
      width: 61,
      generations: 96,
      seedMode: "random",
      randomSeed: 184184,
      boundaryMode: "wrap",
    });
    expect(serializeSettingsQuery(wrapped!.settings)).toBe(
      "?rule=184&width=61&steps=96&seed=random&boundary=wrap&randomSeed=184184",
    );
  });

  it("applies an example over current settings and preserves comparison rule when omitted", () => {
    expect(
      applyGalleryExample(
        {
          rule: 30,
          width: 61,
          generations: 80,
          seedMode: "center",
          boundaryMode: "fixed",
          comparisonRule: 90,
        },
        "sierpinski-center",
      ),
    ).toEqual({
      rule: 90,
      width: 81,
      generations: 81,
      seedMode: "center",
      boundaryMode: "fixed",
      randomSeed: 1,
      customSeed: "",
      comparisonRule: 90,
    });
  });
});
