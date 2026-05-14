import { describe, expect, it, vi } from "vitest";
import {
  createTeacherNotesDocument,
  formatTeacherNotesHtml,
  printTeacherNotes,
} from "./teacherNotes";

describe("teacher notes", () => {
  it("escapes untrusted lesson, prompt, and custom seed text", () => {
    const html = formatTeacherNotesHtml({
      settings: {
        rule: 30,
        width: 15,
        generations: 4,
        seedMode: "custom",
        boundaryMode: "fixed",
        customSeed: '10<1>&"',
      },
      comparison: {
        primaryRule: 30,
        comparisonRule: 90,
        firstDifferingGeneration: 1,
        totalDifferingCells: 8,
        differingCellsByGeneration: [0, 1, 3, 4],
      },
      context: {
        source: "lesson",
        title: 'Edges <change> "the" story',
        description: "Ask & compare <edges>.",
      },
      ruleTable: [
        { neighborhood: "111", result: 0 },
        { neighborhood: "110", result: 0 },
      ],
      rows: [".......#.......", "......###......"],
      prompts: [
        "What changes when edges wrap? <explain>",
        'Compare "30" & 90.',
      ],
    });

    expect(html).toContain("Edges &lt;change&gt; &quot;the&quot; story");
    expect(html).toContain("Ask &amp; compare &lt;edges&gt;.");
    expect(html).toContain("custom 10&lt;1&gt;&amp;&quot;");
    expect(html).toContain("What changes when edges wrap? &lt;explain&gt;");
    expect(html).toContain("Compare &quot;30&quot; &amp; 90.");
    expect(html).not.toContain('10<1>&"');
  });

  it("formats deterministic headings, settings, comparison, rule table, rows, and prompts", () => {
    const html = formatTeacherNotesHtml({
      settings: {
        rule: 90,
        width: 15,
        generations: 3,
        seedMode: "center",
        boundaryMode: "wrap",
        randomSeed: 7,
      },
      comparison: {
        primaryRule: 90,
        comparisonRule: 30,
        firstDifferingGeneration: null,
        totalDifferingCells: 0,
        differingCellsByGeneration: [0, 0, 0],
      },
      context: {
        source: "gallery",
        title: "Sierpinski lattice",
        description: "Center seed fractal.",
      },
      ruleTable: [
        { neighborhood: "111", result: 0 },
        { neighborhood: "110", result: 1 },
        { neighborhood: "101", result: 0 },
        { neighborhood: "100", result: 1 },
        { neighborhood: "011", result: 1 },
        { neighborhood: "010", result: 0 },
        { neighborhood: "001", result: 1 },
        { neighborhood: "000", result: 0 },
      ],
      rows: [".......#.......", "......#.#......", ".....#...#....."],
      prompts: ["Where is the first symmetry?", "What stays invariant?"],
    });

    expect(html).toBe(
      formatTeacherNotesHtml({
        settings: {
          rule: 90,
          width: 15,
          generations: 3,
          seedMode: "center",
          boundaryMode: "wrap",
          randomSeed: 7,
        },
        comparison: {
          primaryRule: 90,
          comparisonRule: 30,
          firstDifferingGeneration: null,
          totalDifferingCells: 0,
          differingCellsByGeneration: [0, 0, 0],
        },
        context: {
          source: "gallery",
          title: "Sierpinski lattice",
          description: "Center seed fractal.",
        },
        ruleTable: [
          { neighborhood: "111", result: 0 },
          { neighborhood: "110", result: 1 },
          { neighborhood: "101", result: 0 },
          { neighborhood: "100", result: 1 },
          { neighborhood: "011", result: 1 },
          { neighborhood: "010", result: 0 },
          { neighborhood: "001", result: 1 },
          { neighborhood: "000", result: 0 },
        ],
        rows: [".......#.......", "......#.#......", ".....#...#....."],
        prompts: ["Where is the first symmetry?", "What stays invariant?"],
      }),
    );
    expect(html).toContain("<title>Ruleloom Lab teacher notes</title>");
    expect(html).toContain("<h1>Ruleloom Lab teacher notes</h1>");
    expect(html).toContain("<dt>Rule</dt><dd>90</dd>");
    expect(html).toContain("<dt>Width</dt><dd>15 cells</dd>");
    expect(html).toContain("<dt>Generations</dt><dd>3 rows</dd>");
    expect(html).toContain("<dt>Seed</dt><dd>center</dd>");
    expect(html).toContain("<dt>Boundary</dt><dd>wrapped circular edges</dd>");
    expect(html).toContain("<dt>Comparison</dt><dd>Rule 90 vs Rule 30</dd>");
    expect(html).toContain("<dt>First differing generation</dt><dd>None</dd>");
    expect(html).toContain("<dt>Total differing cells</dt><dd>0 cells</dd>");
    expect(html).toContain("<td><code>110</code></td><td>1</td>");
    expect(html).toContain(
      '<pre aria-label="Generated rows">.......#.......\n......#.#......\n.....#...#.....</pre>',
    );
    expect(html).toContain("<li>Where is the first symmetry?</li>");
    expect(html).toContain("<li>What stays invariant?</li>");
  });

  it("creates a printable document wrapper around the notes html", () => {
    const documentHtml = createTeacherNotesDocument("<main>Notes</main>");

    expect(documentHtml).toBe("<!doctype html>\n<main>Notes</main>");
  });

  it("prints through injectable browser helpers", () => {
    const written: string[] = [];
    const print = vi.fn();
    const close = vi.fn();
    const opened = {
      document: {
        open: vi.fn(),
        write: vi.fn((value: string) => {
          written.push(value);
        }),
        close,
      },
      focus: vi.fn(),
      print,
    };

    const result = printTeacherNotes("<main>Notes</main>", {
      openPrintTarget: vi.fn(() => opened),
    });

    expect(result).toBe(true);
    expect(written).toEqual(["<!doctype html>\n<main>Notes</main>"]);
    expect(opened.document.open).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    expect(opened.focus).toHaveBeenCalledOnce();
    expect(print).toHaveBeenCalledOnce();
  });

  it("reports false when a print target cannot be opened", () => {
    expect(
      printTeacherNotes("<main>Notes</main>", {
        openPrintTarget: () => null,
      }),
    ).toBe(false);
  });
});
