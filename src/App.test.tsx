import { describe, expect, it, vi } from "vitest";
import {
  copyRleForSettings,
  copyLessonPathPackForPaths,
  copySvgForSettings,
  copyTextForSettings,
  createTeacherNotesForSettings,
  createAppHtml,
  downloadPngForSettings,
  getGalleryExamples,
  getLessonPaths,
  getPresetExplanations,
  importLessonPathPackForSession,
  resolveGalleryApply,
  importRleForSettings,
  printTeacherNotesForSettings,
  resolveKeyboardShortcut,
  resolveLessonPathApply,
} from "./App";
import type { PngCanvasFactory } from "./pngExport";

describe("App", () => {
  it("returns preset explanation metadata in stable curated order", () => {
    expect(getPresetExplanations()).toEqual([
      {
        label: "Rule 30",
        rule: 30,
        explanation:
          "Chaotic, pseudo-random growth from a simple deterministic rule.",
      },
      {
        label: "Rule 90",
        rule: 90,
        explanation:
          "Creates nested Sierpinski triangles that reveal self-similarity.",
      },
      {
        label: "Rule 110",
        rule: 110,
        explanation:
          "Computationally universal behavior with persistent moving structures.",
      },
      {
        label: "Rule 184",
        rule: 184,
        explanation:
          "Models traffic flow as particles moving through local gaps.",
      },
    ]);
  });

  it("renders the core playground UI", () => {
    const html = createAppHtml();

    expect(html).toContain("<h1>Ruleloom Lab</h1>");
    expect(html).toContain('data-action="toggle-projector-mode"');
    expect(html).toContain("Projector mode");
    expect(html).toContain('class="projector-status"');
    expect(html).toContain("Projector mode is off. Full controls are visible.");
    expect(html).toContain('aria-label="Rule 30 preset"');
    expect(html).toContain('aria-label="Rule 90 preset"');
    expect(html).toContain('aria-label="Rule 110 preset"');
    expect(html).toContain('aria-label="Rule 184 preset"');
    expect(html).toContain('aria-label="Rule table"');
    expect(html).toContain('role="grid"');
    expect(html).toContain('role="gridcell"');
    expect(html).toContain('data-action="copy-text"');
    expect(html).toContain("Copy text");
    expect(html).toContain('data-action="copy-svg"');
    expect(html).toContain("Copy SVG");
    expect(html).toContain('data-action="copy-rle"');
    expect(html).toContain("Copy RLE");
    expect(html).toContain('id="rleImport"');
    expect(html).toContain('data-action="import-rle"');
    expect(html).toContain("Import RLE");
    expect(html).toContain('data-action="download-png"');
    expect(html).toContain("Download PNG");
    expect(html).toContain('data-action="print-teacher-notes"');
    expect(html).toContain("Print teacher notes");
    expect(html).toContain('aria-label="Export status"');
    expect(html).toContain('<select id="boundaryMode"');
    expect(html).toContain("Fixed zero edges");
    expect(html).toContain("Wrapped circular edges");
    expect(html).toContain("Compare with rule");
    expect(html).toContain('id="comparisonRule"');
    expect(html).toContain("First differing generation");
    expect(html).toContain("Total differing cells");
  });

  it("renders projector mode with shell class, exit label, and live status", () => {
    const html = createAppHtml(
      {
        rule: 90,
        width: 61,
        generations: 80,
        seedMode: "center",
        boundaryMode: "wrap",
      },
      "",
      "",
      {},
      true,
    );

    expect(html).toContain('<main class="shell projector-mode">');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Exit projector mode");
    expect(html).toContain('role="status"');
    expect(html).toContain(
      "Projector mode is on. Showing Rule 90, 61 cells, 80 rows, Wrapped edges.",
    );
  });

  it("renders deterministic rule comparison summary for the current settings", () => {
    const html = createAppHtml({
      rule: 30,
      width: 15,
      generations: 5,
      seedMode: "center",
      boundaryMode: "fixed",
    });

    expect(html).toContain('value="90"');
    expect(html).toContain("Rule 30 vs Rule 90");
    expect(html).toContain("Generation 1");
    expect(html).toContain("8 cells differ");
  });

  it("renders discoverable keyboard shortcut guidance", () => {
    const html = createAppHtml();

    expect(html).toContain("Keyboard shortcuts");
    expect(html).toContain("Space: Run/Pause");
    expect(html).toContain("ArrowRight or .: Step");
    expect(html).toContain("R: Reset");
    expect(html).toContain("1-4: Presets");
  });

  it("maps keyboard shortcuts to deterministic actions", () => {
    expect(resolveKeyboardShortcut({ key: " " })).toEqual({
      type: "toggleRun",
    });
    expect(resolveKeyboardShortcut({ key: "ArrowRight" })).toEqual({
      type: "step",
    });
    expect(resolveKeyboardShortcut({ key: "." })).toEqual({ type: "step" });
    expect(resolveKeyboardShortcut({ key: "r" })).toEqual({ type: "reset" });
    expect(resolveKeyboardShortcut({ key: "R" })).toEqual({ type: "reset" });
    expect(resolveKeyboardShortcut({ key: "1" })).toEqual({
      type: "preset",
      rule: 30,
    });
    expect(resolveKeyboardShortcut({ key: "2" })).toEqual({
      type: "preset",
      rule: 90,
    });
    expect(resolveKeyboardShortcut({ key: "3" })).toEqual({
      type: "preset",
      rule: 110,
    });
    expect(resolveKeyboardShortcut({ key: "4" })).toEqual({
      type: "preset",
      rule: 184,
    });
    expect(resolveKeyboardShortcut({ key: "5" })).toBeUndefined();
  });

  it("does not resolve shortcuts while typing in form controls", () => {
    for (const tagName of ["input", "select", "textarea", "button"]) {
      expect(
        resolveKeyboardShortcut({ key: " ", targetTagName: tagName }),
      ).toBeUndefined();
      expect(
        resolveKeyboardShortcut({ key: "1", targetTagName: tagName }),
      ).toBeUndefined();
    }
  });

  it("renders boundary mode status readback", () => {
    const html = createAppHtml({
      rule: 30,
      width: 15,
      generations: 5,
      seedMode: "center",
      boundaryMode: "wrap",
    });

    expect(html).toContain("Wrapped edges");
    expect(html).toContain(
      '<option value="wrap" selected>Wrapped circular edges</option>',
    );
  });

  it("renders preset explanations near the preset controls", () => {
    const html = createAppHtml();

    expect(html).toContain('class="preset-explanations"');
    for (const preset of getPresetExplanations()) {
      expect(html).toContain(`data-preset-explanation="${preset.rule}"`);
      expect(html).toContain(`<strong>${preset.label}</strong>`);
      expect(html).toContain(preset.explanation);
      expect(html.indexOf(`data-preset="${preset.rule}"`)).toBeLessThan(
        html.indexOf(`data-preset-explanation="${preset.rule}"`),
      );
    }
  });

  it("renders gallery examples with apply buttons and observation copy", () => {
    const html = createAppHtml();

    expect(html).toContain('class="gallery-examples"');
    expect(html).toContain("Gallery examples");
    expect(html).toContain('for="gallerySeedMode"');
    expect(html).toContain("Seed filter");
    expect(html).toContain('for="galleryBoundaryMode"');
    expect(html).toContain("Boundary filter");
    expect(html).toContain('for="galleryDifficulty"');
    expect(html).toContain("Difficulty");
    for (const example of getGalleryExamples()) {
      expect(html).toContain(`data-gallery-example="${example.id}"`);
      expect(html).toContain(`<strong>${example.title}</strong>`);
      expect(html).toContain(example.description);
      expect(html).toContain(example.lookFor);
      expect(html).toContain("Apply");
    }
  });

  it("renders only gallery cards matching selected filters", () => {
    const html = createAppHtml(undefined, "", "", {
      seedMode: "random",
      boundaryMode: "fixed",
      difficulty: "intermediate",
    });

    expect(html).toContain('value="random" selected');
    expect(html).toContain('data-gallery-example="rule-30-random-field"');
    expect(html).not.toContain('data-gallery-example="wrapped-traffic-loop"');
    expect(html).not.toContain('data-gallery-example="sierpinski-center"');
    expect(html).not.toContain(
      'data-gallery-example="custom-seed-glider-lanes"',
    );
    expect(html).toContain('data-gallery-apply="rule-30-random-field"');
  });

  it("renders a friendly empty gallery state when filters have no matches", () => {
    const html = createAppHtml(undefined, "", "", {
      seedMode: "center",
      boundaryMode: "wrap",
      difficulty: "advanced",
    });

    expect(html).toContain('role="status"');
    expect(html).toContain("No gallery examples match these filters yet.");
    expect(html).not.toContain("data-gallery-apply=");
  });

  it("renders lesson paths with prompts and accessible step apply controls", () => {
    const importedPath = {
      id: "local-wrap-study",
      title: "Local wrap study",
      summary: "Compare wrapped motion with a small deterministic seed.",
      estimatedMinutes: 8,
      audience: "Small group",
      steps: [
        {
          prompt: "Where does the moving band re-enter the row?",
          settings: {
            rule: 184,
            width: 31,
            generations: 24,
            seedMode: "random" as const,
            boundaryMode: "wrap" as const,
            randomSeed: 184,
            customSeed: "",
          },
          comparisonRule: 226,
        },
      ],
    };
    const html = createAppHtml(
      undefined,
      "",
      "",
      {},
      false,
      [importedPath],
      "",
      "Imported 1 local lesson path.",
    );

    expect(html).toContain('class="lesson-paths"');
    expect(html).toContain("Lesson paths");
    expect(html).toContain("Run a short guided sequence");
    expect(html).toContain('data-action="copy-lesson-path-pack"');
    expect(html).toContain("Copy built-in lesson paths");
    expect(html).toContain('id="lessonPathPackImport"');
    expect(html).toContain('data-action="import-lesson-path-pack"');
    expect(html).toContain("Import lesson path pack");
    expect(html).toContain("Imported 1 local lesson path.");
    for (const path of getLessonPaths()) {
      expect(html).toContain(`data-lesson-path="${path.id}"`);
      expect(html).toContain(`<strong>${path.title}</strong>`);
      expect(html).toContain(path.summary);
      expect(html).toContain(`${path.estimatedMinutes} min`);
      expect(html).toContain(path.audience);
      path.steps.forEach((step, index) => {
        expect(html).toContain(`data-lesson-path-apply="${path.id}"`);
        expect(html).toContain(`data-lesson-step="${index}"`);
        expect(html).toContain(step.prompt);
        expect(html).toContain(
          `aria-label="Apply ${path.title} step ${index + 1}"`,
        );
      });
    }
    expect(html).toContain('data-lesson-path="local-wrap-study"');
    expect(html).toContain("Local wrap study");
    expect(html.indexOf("Lesson paths")).toBeLessThan(
      html.indexOf("Gallery examples"),
    );
  });

  it("copies the built-in lesson path pack as deterministic JSON", async () => {
    const writeText = vi
      .fn<[(value: string) => Promise<void>]>()
      .mockResolvedValue(undefined);

    await copyLessonPathPackForPaths(getLessonPaths(), writeText);

    expect(writeText).toHaveBeenCalledOnce();
    expect(JSON.parse(writeText.mock.calls[0][0])).toEqual({
      schemaVersion: 1,
      lessonPaths: getLessonPaths(),
    });
  });

  it("imports local lesson path packs for the current session", () => {
    const result = importLessonPathPackForSession(
      JSON.stringify({
        schemaVersion: 1,
        lessonPaths: [
          {
            id: "local-center-study",
            title: "Local center study",
            summary: "Try a local-only center seed prompt.",
            estimatedMinutes: 5,
            audience: "Pair work",
            steps: [
              {
                prompt: "What stays symmetric?",
                settings: {
                  rule: 90,
                  width: 31,
                  generations: 31,
                  seedMode: "center",
                  boundaryMode: "fixed",
                },
              },
            ],
          },
        ],
      }),
    );

    expect(result).toEqual({
      lessonPaths: [
        {
          id: "local-center-study",
          title: "Local center study",
          summary: "Try a local-only center seed prompt.",
          estimatedMinutes: 5,
          audience: "Pair work",
          steps: [
            {
              prompt: "What stays symmetric?",
              settings: {
                rule: 90,
                width: 31,
                generations: 31,
                seedMode: "center",
                boundaryMode: "fixed",
                randomSeed: 1,
                customSeed: "",
              },
              comparisonRule: 90,
            },
          ],
        },
      ],
      status: "Imported 1 local lesson path for this browser session.",
    });
  });

  it("applies gallery settings and resets visible playback state", () => {
    expect(
      resolveGalleryApply(
        {
          rule: 30,
          width: 61,
          generations: 80,
          seedMode: "center",
          boundaryMode: "fixed",
          comparisonRule: 90,
        },
        42,
        "custom-seed-glider-lanes",
      ),
    ).toEqual({
      settings: {
        rule: 110,
        width: 73,
        generations: 100,
        seedMode: "custom",
        boundaryMode: "fixed",
        randomSeed: 1,
        customSeed:
          "0000000000000000000000000000000011101000100111000000000000000000000000000",
        comparisonRule: 54,
      },
      visibleGenerations: 1,
      shareQuery:
        "?rule=110&width=73&steps=100&seed=custom&boundary=fixed&randomSeed=1&customSeed=0000000000000000000000000000000011101000100111000000000000000000000000000",
    });
  });

  it("applies lesson path step settings and resets visible playback state", () => {
    expect(
      resolveLessonPathApply(
        {
          rule: 30,
          width: 61,
          generations: 80,
          seedMode: "center",
          boundaryMode: "fixed",
          comparisonRule: 90,
        },
        42,
        "edges-change-the-story",
        1,
      ),
    ).toEqual({
      settings: {
        rule: 184,
        width: 61,
        generations: 96,
        seedMode: "random",
        boundaryMode: "wrap",
        randomSeed: 184184,
        customSeed: "",
        comparisonRule: 226,
      },
      visibleGenerations: 1,
      shareQuery:
        "?rule=184&width=61&steps=96&seed=random&boundary=wrap&randomSeed=184184",
    });
    expect(
      resolveLessonPathApply(
        {
          rule: 30,
          width: 61,
          generations: 80,
          seedMode: "center",
          boundaryMode: "fixed",
          comparisonRule: 90,
        },
        42,
        "missing-path",
        0,
      ),
    ).toBeNull();
  });

  it("shows rule table neighborhoods from 111 to 000", () => {
    const html = createAppHtml();

    for (const neighborhood of [
      "111",
      "110",
      "101",
      "100",
      "011",
      "010",
      "001",
      "000",
    ]) {
      expect(html).toContain(`<code>${neighborhood}</code>`);
    }
  });

  it("copies SVG for the current visible generations", async () => {
    const writeText = vi
      .fn<[(value: string) => Promise<void>]>()
      .mockResolvedValue(undefined);

    await copySvgForSettings(
      {
        rule: 90,
        width: 15,
        generations: 80,
        seedMode: "center",
      },
      3,
      writeText,
    );

    expect(writeText).toHaveBeenCalledOnce();
    const copied = writeText.mock.calls[0][0];
    expect(copied).toContain("<svg");
    expect(copied).toContain("Ruleloom Lab Rule 90");
    expect(copied).toContain('width="120" height="24"');
    expect(copied).toContain("3 generations");
    expect(copied).not.toContain('y="24"');
  });

  it("copies plain text for the current visible generations", async () => {
    const writeText = vi
      .fn<[(value: string) => Promise<void>]>()
      .mockResolvedValue(undefined);

    await copyTextForSettings(
      {
        rule: 90,
        width: 15,
        generations: 80,
        seedMode: "center",
        boundaryMode: "fixed",
      },
      3,
      writeText,
    );

    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0][0]).toBe(`# Ruleloom Lab pattern
rule: 90
width: 15
generations: 3
seed: center
boundary: fixed

.......#.......
......#.#......
.....#...#.....`);
  });

  it("copies RLE-like text for the current visible generations", async () => {
    const writeText = vi
      .fn<[(value: string) => Promise<void>]>()
      .mockResolvedValue(undefined);

    await copyRleForSettings(
      {
        rule: 90,
        width: 15,
        generations: 80,
        seedMode: "center",
        boundaryMode: "fixed",
      },
      3,
      writeText,
    );

    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0][0]).toBe(`# Ruleloom Lab
# rule: 90
# width: 15
# generations: 3
# seed mode: center
# boundary mode: fixed
x = 15, y = 3, rule = W90
7bo7b$6bobo6b$5bo3bo5b!`);
  });

  it("imports pasted RLE text as custom editable settings", () => {
    expect(
      importRleForSettings(`# Ruleloom Lab
# rule: 90
# width: 15
# generations: 3
# seed mode: center
# boundary mode: fixed
x = 15, y = 3, rule = W90
7bo7b$6bobo6b$5bo3bo5b!`),
    ).toEqual({
      settings: {
        rule: 90,
        width: 15,
        generations: 3,
        seedMode: "custom",
        boundaryMode: "fixed",
        customSeed: "000000010000000",
      },
      status: "Imported Rule 90, 15 cells, 3 rows from RLE.",
    });
  });

  it("downloads PNG for the current visible generations", async () => {
    const downloads: Array<{ dataUrl: string; filename: string }> = [];
    const factory: PngCanvasFactory = {
      createCanvas() {
        return {
          context: {
            fillStyle: "",
            fillRect: vi.fn(),
          },
          encodePng: vi
            .fn()
            .mockResolvedValue("data:image/png;base64,ruleloom"),
        };
      },
    };

    const payload = await downloadPngForSettings(
      {
        rule: 90,
        width: 15,
        generations: 80,
        seedMode: "center",
        boundaryMode: "fixed",
      },
      3,
      factory,
      (dataUrl, filename) => {
        downloads.push({ dataUrl, filename });
      },
    );

    expect(payload).toMatchObject({
      dataUrl: "data:image/png;base64,ruleloom",
      filename: "ruleloom-rule-90-w15-g3-center-fixed.png",
      height: 24,
      width: 120,
    });
    expect(downloads).toEqual([
      {
        dataUrl: "data:image/png;base64,ruleloom",
        filename: "ruleloom-rule-90-w15-g3-center-fixed.png",
      },
    ]);
  });

  it("creates teacher notes from current visible settings", () => {
    const html = createTeacherNotesForSettings(
      {
        rule: 90,
        comparisonRule: 30,
        width: 15,
        generations: 80,
        seedMode: "center",
        boundaryMode: "wrap",
      },
      3,
      {
        source: "gallery",
        title: "Sierpinski lattice",
        description: "Center seed fractal.",
      },
      ["What stays symmetrical?"],
    );

    expect(html).toContain("<h1>Ruleloom Lab teacher notes</h1>");
    expect(html).toContain("<dt>Rule</dt><dd>90</dd>");
    expect(html).toContain("<dt>Generations</dt><dd>3 rows</dd>");
    expect(html).toContain("<dt>Boundary</dt><dd>wrapped circular edges</dd>");
    expect(html).toContain("<dt>Comparison</dt><dd>Rule 90 vs Rule 30</dd>");
    expect(html).toContain("Sierpinski lattice");
    expect(html).toContain("Center seed fractal.");
    expect(html).toContain("<td><code>111</code></td><td>0</td>");
    expect(html).toContain(".......#.......");
    expect(html).toContain("......#.#......");
    expect(html).toContain(".....#...#.....");
    expect(html).toContain("<li>What stays symmetrical?</li>");
  });

  it("prints teacher notes through injected print target helpers", () => {
    const write = vi.fn();
    const print = vi.fn();
    const result = printTeacherNotesForSettings(
      {
        rule: 30,
        comparisonRule: 90,
        width: 15,
        generations: 80,
        seedMode: "center",
        boundaryMode: "fixed",
      },
      3,
      undefined,
      ["What changes first?"],
      {
        openPrintTarget: () => ({
          document: {
            open: vi.fn(),
            write,
            close: vi.fn(),
          },
          print,
        }),
      },
    );

    expect(result).toBe(true);
    expect(write).toHaveBeenCalledOnce();
    expect(write.mock.calls[0][0]).toContain("<!doctype html>");
    expect(write.mock.calls[0][0]).toContain("What changes first?");
    expect(print).toHaveBeenCalledOnce();
  });
});
