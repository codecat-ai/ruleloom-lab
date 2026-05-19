import { describe, expect, it } from "vitest";
import {
  addGenerationAnnotation,
  parseGenerationAnnotationsJson,
  removeGenerationAnnotation,
  serializeGenerationAnnotations,
  sortGenerationAnnotations,
  type GenerationAnnotation,
} from "./generationAnnotations";

describe("generation annotations", () => {
  const deterministicOptions = {
    createId: () => "annotation-1",
    now: () => "2026-05-19T04:05:06.000Z",
  };

  it("adds a trimmed annotation with injected id and clock", () => {
    expect(
      addGenerationAnnotation(
        [],
        {
          generation: 12,
          label: "  First glider lane  ",
          note: "  Ask learners what repeats.  ",
        },
        deterministicOptions,
      ),
    ).toEqual([
      {
        id: "annotation-1",
        generation: 12,
        label: "First glider lane",
        note: "Ask learners what repeats.",
        createdAt: "2026-05-19T04:05:06.000Z",
      },
    ]);
  });

  it("omits blank notes and leaves the input array untouched", () => {
    const existing: GenerationAnnotation[] = [
      {
        id: "existing",
        generation: 2,
        label: "Existing",
        createdAt: "2026-05-19T00:00:00.000Z",
      },
    ];

    const next = addGenerationAnnotation(
      existing,
      {
        generation: 3,
        label: "New",
        note: "   ",
      },
      deterministicOptions,
    );

    expect(next).toHaveLength(2);
    expect(next[1]).toEqual({
      id: "annotation-1",
      generation: 3,
      label: "New",
      createdAt: "2026-05-19T04:05:06.000Z",
    });
    expect(existing).toHaveLength(1);
  });

  it("rejects invalid generations, empty labels, and overlong labels", () => {
    expect(() =>
      addGenerationAnnotation(
        [],
        { generation: -1, label: "Start" },
        deterministicOptions,
      ),
    ).toThrow("generation must be a non-negative integer");
    expect(() =>
      addGenerationAnnotation(
        [],
        { generation: 1.5, label: "Start" },
        deterministicOptions,
      ),
    ).toThrow("generation must be a non-negative integer");
    expect(() =>
      addGenerationAnnotation(
        [],
        { generation: 1, label: "   " },
        deterministicOptions,
      ),
    ).toThrow("label is required");
    expect(() =>
      addGenerationAnnotation(
        [],
        { generation: 1, label: "x".repeat(81) },
        deterministicOptions,
      ),
    ).toThrow("label must be 80 characters or fewer");
  });

  it("removes annotations by id without mutating the input array", () => {
    const annotations: GenerationAnnotation[] = [
      {
        id: "a",
        generation: 1,
        label: "A",
        createdAt: "2026-05-19T00:00:00.000Z",
      },
      {
        id: "b",
        generation: 2,
        label: "B",
        createdAt: "2026-05-19T00:00:01.000Z",
      },
    ];

    expect(removeGenerationAnnotation(annotations, "a")).toEqual([
      annotations[1],
    ]);
    expect(annotations).toHaveLength(2);
  });

  it("sorts by generation, createdAt, then label without mutating", () => {
    const annotations: GenerationAnnotation[] = [
      {
        id: "late",
        generation: 4,
        label: "Late",
        createdAt: "2026-05-19T00:00:02.000Z",
      },
      {
        id: "alpha",
        generation: 4,
        label: "Alpha",
        createdAt: "2026-05-19T00:00:01.000Z",
      },
      {
        id: "beta",
        generation: 4,
        label: "Beta",
        createdAt: "2026-05-19T00:00:01.000Z",
      },
      {
        id: "first",
        generation: 1,
        label: "First",
        createdAt: "2026-05-19T00:00:03.000Z",
      },
    ];

    expect(sortGenerationAnnotations(annotations).map(({ id }) => id)).toEqual([
      "first",
      "alpha",
      "beta",
      "late",
    ]);
    expect(annotations[0].id).toBe("late");
  });

  it("serializes deterministic schema-versioned JSON and imports it", () => {
    const annotations: GenerationAnnotation[] = [
      {
        id: "one",
        generation: 1,
        label: "Opening spark",
        note: "Symmetric first row.",
        createdAt: "2026-05-19T00:00:00.000Z",
      },
    ];

    const json = serializeGenerationAnnotations(annotations);

    expect(JSON.parse(json)).toEqual({
      schemaVersion: 1,
      annotations,
    });
    expect(parseGenerationAnnotationsJson(json)).toEqual(annotations);
  });

  it("imports legacy annotations with missing notes", () => {
    expect(
      parseGenerationAnnotationsJson(
        JSON.stringify({
          schemaVersion: 1,
          annotations: [
            {
              id: "legacy",
              generation: 7,
              label: "Legacy mark",
              createdAt: "2026-05-19T00:00:00.000Z",
            },
          ],
        }),
      ),
    ).toEqual([
      {
        id: "legacy",
        generation: 7,
        label: "Legacy mark",
        createdAt: "2026-05-19T00:00:00.000Z",
      },
    ]);
  });

  it("reports helpful import errors for malformed data", () => {
    expect(() => parseGenerationAnnotationsJson("{")).toThrow(
      "Annotation JSON is not valid JSON",
    );
    expect(() =>
      parseGenerationAnnotationsJson(
        JSON.stringify({ schemaVersion: 2, annotations: [] }),
      ),
    ).toThrow("schemaVersion must be 1");
    expect(() =>
      parseGenerationAnnotationsJson(
        JSON.stringify({
          schemaVersion: 1,
          annotations: [{ id: "bad", generation: -1, label: "Bad" }],
        }),
      ),
    ).toThrow("annotations[0].generation must be a non-negative integer");
  });
});
