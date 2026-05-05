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
      customSeed: "10101"
    };

    expect(parseSettingsQuery(serializeSettingsQuery(settings))).toEqual(settings);
  });

  it("restores documented settings query", () => {
    expect(parseSettingsQuery("?rule=90&width=61&steps=80&seed=center")).toMatchObject({
      rule: 90,
      width: 61,
      generations: 80,
      seedMode: "center"
    });
  });
});
