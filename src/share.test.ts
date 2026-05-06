import { describe, expect, it } from "vitest";
import { parseSettingsQuery, serializeSettingsQuery } from "./share";

describe("share helpers", () => {
  it("parses query strings into clamped settings", () => {
    expect(parseSettingsQuery("?rule=999&width=10&steps=80&seed=center")).toMatchObject({
      rule: 255,
      width: 15,
      generations: 80,
      seedMode: "center"
    });
  });

  it("round trips settings through a query string", () => {
    const settings = {
      rule: 90,
      width: 61,
      generations: 80,
      seedMode: "random" as const,
      randomSeed: 12345,
      customSeed: "10101",
      boundaryMode: "wrap" as const
    };

    expect(parseSettingsQuery(serializeSettingsQuery(settings))).toEqual(settings);
  });

  it("parses invalid boundary mode values back to fixed", () => {
    expect(parseSettingsQuery("?rule=90&width=61&steps=80&boundary=torus")).toMatchObject({
      boundaryMode: "fixed"
    });
  });

  it("serializes fixed boundary mode for share URL compatibility", () => {
    expect(
      serializeSettingsQuery({
        rule: 90,
        width: 61,
        generations: 80,
        seedMode: "center",
        boundaryMode: "fixed"
      })
    ).toContain("boundary=fixed");
  });

  it("restores documented settings query", () => {
    expect(parseSettingsQuery("?rule=90&width=61&steps=80&seed=center")).toMatchObject({
      rule: 90,
      width: 61,
      generations: 80,
      seedMode: "center",
      boundaryMode: "fixed"
    });
  });
});
