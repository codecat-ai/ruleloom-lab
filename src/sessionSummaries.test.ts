import { describe, expect, it } from "vitest";
import { formatSessionSummary } from "./sessionSummaries";

describe("formatSessionSummary", () => {
  it("formats a deterministic current setup without annotations or context", () => {
    expect(
      formatSessionSummary({
        settings: {
          rule: 90,
          comparisonRule: 30,
          width: 15,
          generations: 3,
          seedMode: "center",
          boundaryMode: "fixed",
        },
        comparison: {
          primaryRule: 90,
          comparisonRule: 30,
          firstDifferingGeneration: 1,
          totalDifferingCells: 8,
        },
      }),
    ).toBe(`Ruleloom Lab session summary

Setup
- Active rule: Rule 90
- Comparison: Rule 90 vs Rule 30
- First differing generation: Generation 1
- Total differing cells: 8
- Width: 15 cells
- Generations: 3 rows
- Seed: center
- Boundary: fixed zero edges

Context
- None

Annotations
- None

Export hints
- PNG: Download PNG captures the currently visible rows.
- SVG: Copy SVG produces a standalone vector snapshot.
- Plain text: Copy text produces a monospaced pattern with setup metadata.
- RLE: Copy RLE produces Ruleloom RLE that can be pasted back into Import RLE.
- Teacher notes: Print teacher notes creates a printable facilitator handout.`);
  });

  it("includes sorted annotations with optional notes", () => {
    expect(
      formatSessionSummary({
        settings: {
          rule: 184,
          comparisonRule: 226,
          width: 61,
          generations: 12,
          seedMode: "random",
          randomSeed: 184184,
          boundaryMode: "wrap",
        },
        annotations: [
          {
            id: "late",
            generation: 9,
            label: "Jam forms",
            createdAt: "2026-05-19T00:00:02.000Z",
          },
          {
            id: "early",
            generation: 4,
            label: "First lane split",
            note: "Ask learners to compare edge traffic.",
            createdAt: "2026-05-19T00:00:01.000Z",
          },
        ],
      }),
    ).toContain(`Annotations
- Generation 4: First lane split - Ask learners to compare edge traffic.
- Generation 9: Jam forms`);
  });

  it("includes lesson context with timing cues", () => {
    expect(
      formatSessionSummary({
        settings: {
          rule: 110,
          comparisonRule: 54,
          width: 73,
          generations: 24,
          seedMode: "custom",
          customSeed: "00011101000100111000",
          boundaryMode: "fixed",
        },
        context: {
          source: "lesson",
          title: "Patterns from one spark",
          summary: "Start with one spark, then compare lanes.",
          prompt: "Where do the moving lanes split?",
        },
        timingCues: [
          {
            stepId: "warmup",
            title: "Step 1",
            suggestedMinutes: 8,
            startMinute: 0,
            endMinute: 8,
            phaseLabel: "Explore",
            facilitatorPrompt: "What repeats?",
          },
          {
            stepId: "reflect",
            title: "Step 2",
            suggestedMinutes: 8,
            startMinute: 8,
            endMinute: 16,
            phaseLabel: "Reflect",
            facilitatorPrompt: "Where did the lanes split?",
          },
        ],
      }),
    ).toContain(`Context
- Source: lesson
- Title: Patterns from one spark
- Summary: Start with one spark, then compare lanes.
- Prompt: Where do the moving lanes split?

Timing cues
- 0-8 min | Explore | Step 1 | What repeats?
- 8-16 min | Reflect | Step 2 | Where did the lanes split?`);
  });

  it("normalizes unsafe and overlong user text without leaking nullish values", () => {
    const summary = formatSessionSummary({
      settings: {
        rule: 30,
        comparisonRule: 90,
        width: 31,
        generations: 5,
        seedMode: "custom",
        customSeed: "1010\n0101\t1111000011110000",
        boundaryMode: "wrap",
      },
      context: {
        source: "gallery",
        title: `  ${"Unsafe <title> ".repeat(20)}  `,
        summary: "\nPrompt with\tmultiple   spaces and <tags>.\n",
      },
      annotations: [
        {
          id: "unsafe",
          generation: 2,
          label: ` ${"Long label ".repeat(20)} `,
          note: ` ${"Long note ".repeat(30)} `,
          createdAt: "2026-05-19T00:00:00.000Z",
        },
      ],
    });

    expect(summary).toContain("Unsafe <title> Unsafe <title>");
    expect(summary).toContain("Prompt with multiple spaces and <tags>.");
    expect(summary).toContain("...");
    expect(summary).not.toContain("undefined");
    expect(summary).not.toContain("null");
    expect(summary).not.toContain("\t");
    expect(summary).not.toContain("\n\n\n");
  });
});
