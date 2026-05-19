import { describe, expect, it } from "vitest";
import {
  COMPARISON_SET_STORAGE_KEY,
  createComparisonSetFromSettings,
  exportComparisonSetsJson,
  importComparisonSetsJson,
  listComparisonSets,
  removeComparisonSet,
  saveComparisonSet,
  savedComparisonSetToSettings,
  type ComparisonSetStorage,
} from "./comparisonSets";

class FakeStorage implements ComparisonSetStorage {
  private readonly items = new Map<string, string>();

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

describe("comparisonSets", () => {
  it("creates a bounded saved set from current comparison settings", () => {
    expect(
      createComparisonSetFromSettings(
        {
          rule: 30,
          comparisonRule: 90,
          width: 61,
          generations: 80,
          seedMode: "random",
          boundaryMode: "wrap",
          randomSeed: 3030,
          customSeed: "101",
        },
        {
          title: "  Noise workshop  ",
          note: "  Compare shared seeds.  ",
        },
        {
          createId: () => "set-noise",
          now: () => "2026-05-19T00:00:00.000Z",
        },
      ),
    ).toEqual({
      schemaVersion: 1,
      id: "set-noise",
      title: "Noise workshop",
      note: "Compare shared seeds.",
      primaryRule: 30,
      comparisonRule: 90,
      width: 61,
      generations: 80,
      seedMode: "random",
      boundaryMode: "wrap",
      randomSeed: 3030,
      customSeed: "101",
      createdAt: "2026-05-19T00:00:00.000Z",
    });
  });

  it("saves and lists cloned sets in deterministic title order", () => {
    const storage = new FakeStorage();
    const later = createComparisonSetFromSettings(
      {
        rule: 184,
        comparisonRule: 226,
        width: 31,
        generations: 24,
        seedMode: "center",
        boundaryMode: "fixed",
      },
      { title: "Wrapped traffic" },
      {
        createId: () => "traffic",
        now: () => "2026-05-19T00:00:02.000Z",
      },
    );
    const earlier = createComparisonSetFromSettings(
      {
        rule: 90,
        comparisonRule: 30,
        width: 15,
        generations: 12,
        seedMode: "center",
        boundaryMode: "fixed",
      },
      { title: "Sierpinski warmup" },
      {
        createId: () => "sierpinski",
        now: () => "2026-05-19T00:00:01.000Z",
      },
    );

    saveComparisonSet(storage, later);
    saveComparisonSet(storage, earlier);

    const listed = listComparisonSets(storage);
    expect(listed.map((set) => set.id)).toEqual(["sierpinski", "traffic"]);

    listed[0].title = "Mutated by UI";
    expect(listComparisonSets(storage)[0].title).toBe("Sierpinski warmup");
  });

  it("applies a saved set back to app comparison settings", () => {
    const set = createComparisonSetFromSettings(
      {
        rule: 110,
        comparisonRule: 54,
        width: 73,
        generations: 100,
        seedMode: "custom",
        boundaryMode: "fixed",
        randomSeed: 1,
        customSeed: "111010",
      },
      { title: "Custom lanes" },
      {
        createId: () => "lanes",
        now: () => "2026-05-19T00:00:00.000Z",
      },
    );

    expect(savedComparisonSetToSettings(set)).toEqual({
      rule: 110,
      comparisonRule: 54,
      width: 73,
      generations: 100,
      seedMode: "custom",
      boundaryMode: "fixed",
      randomSeed: 1,
      customSeed: "111010",
    });
  });

  it("removes sets by id and clears storage when the list becomes empty", () => {
    const storage = new FakeStorage();
    const set = createComparisonSetFromSettings(
      {
        rule: 30,
        comparisonRule: 90,
        width: 61,
        generations: 80,
        seedMode: "center",
        boundaryMode: "fixed",
      },
      { title: "Temporary" },
      {
        createId: () => "temporary",
        now: () => "2026-05-19T00:00:00.000Z",
      },
    );

    saveComparisonSet(storage, set);
    expect(removeComparisonSet(storage, "temporary")).toEqual([]);
    expect(storage.getItem(COMPARISON_SET_STORAGE_KEY)).toBeNull();
  });

  it("exports and imports comparison set JSON into injected storage", () => {
    const source = new FakeStorage();
    const target = new FakeStorage();
    saveComparisonSet(
      source,
      createComparisonSetFromSettings(
        {
          rule: 90,
          comparisonRule: 30,
          width: 61,
          generations: 80,
          seedMode: "center",
          boundaryMode: "fixed",
        },
        { title: "Sierpinski study" },
        {
          createId: () => "study",
          now: () => "2026-05-19T00:00:00.000Z",
        },
      ),
    );

    const json = exportComparisonSetsJson(source);
    expect(JSON.parse(json)).toEqual({
      schemaVersion: 1,
      comparisonSets: [listComparisonSets(source)[0]],
    });
    expect(importComparisonSetsJson(target, json)).toEqual(
      listComparisonSets(source),
    );
    expect(listComparisonSets(target)).toEqual(listComparisonSets(source));
  });

  it("accepts legacy missing optional fields with defaults", () => {
    const storage = new FakeStorage();

    importComparisonSetsJson(
      storage,
      JSON.stringify({
        schemaVersion: 1,
        comparisonSets: [
          {
            schemaVersion: 1,
            id: "legacy",
            title: "Legacy set",
            primaryRule: 90,
            comparisonRule: 30,
            width: 61,
            generations: 80,
            seedMode: "center",
            boundaryMode: "fixed",
            createdAt: "2026-05-19T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(listComparisonSets(storage)[0]).toMatchObject({
      randomSeed: 1,
      customSeed: "",
    });
    expect(listComparisonSets(storage)[0]).not.toHaveProperty("note");
  });

  it("rejects malformed imports with helpful field errors", () => {
    const storage = new FakeStorage();

    expect(() =>
      importComparisonSetsJson(
        storage,
        JSON.stringify({
          schemaVersion: 1,
          comparisonSets: [
            {
              schemaVersion: 1,
              id: "bad",
              title: "",
              primaryRule: 999,
              comparisonRule: 30,
              width: 61,
              generations: 80,
              seedMode: "center",
              boundaryMode: "fixed",
              createdAt: "2026-05-19T00:00:00.000Z",
            },
          ],
        }),
      ),
    ).toThrow("comparisonSets[0].title is required.");

    expect(() =>
      importComparisonSetsJson(
        storage,
        JSON.stringify({
          schemaVersion: 1,
          comparisonSets: [
            {
              schemaVersion: 1,
              id: "bad-seed",
              title: "Bad seed",
              primaryRule: 30,
              comparisonRule: 90,
              width: 61,
              generations: 80,
              seedMode: "coin",
              boundaryMode: "fixed",
              createdAt: "2026-05-19T00:00:00.000Z",
            },
          ],
        }),
      ),
    ).toThrow("comparisonSets[0].seedMode must be center, random, or custom.");
  });

  it("rejects malformed local storage instead of returning unsafe records", () => {
    const storage = new FakeStorage();
    storage.setItem(COMPARISON_SET_STORAGE_KEY, "{not json");

    expect(() => listComparisonSets(storage)).toThrow(
      "Comparison set JSON is not valid JSON.",
    );
  });
});
