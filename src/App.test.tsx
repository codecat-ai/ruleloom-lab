import { describe, expect, it, vi } from "vitest";
import {
  copyRleForSettings,
  copySvgForSettings,
  copyTextForSettings,
  createAppHtml,
  getPresetExplanations,
  resolveKeyboardShortcut
} from "./App";

describe("App", () => {
  it("returns preset explanation metadata in stable curated order", () => {
    expect(getPresetExplanations()).toEqual([
      {
        label: "Rule 30",
        rule: 30,
        explanation: "Chaotic, pseudo-random growth from a simple deterministic rule."
      },
      {
        label: "Rule 90",
        rule: 90,
        explanation: "Creates nested Sierpinski triangles that reveal self-similarity."
      },
      {
        label: "Rule 110",
        rule: 110,
        explanation: "Computationally universal behavior with persistent moving structures."
      },
      {
        label: "Rule 184",
        rule: 184,
        explanation: "Models traffic flow as particles moving through local gaps."
      }
    ]);
  });

  it("renders the core playground UI", () => {
    const html = createAppHtml();

    expect(html).toContain("<h1>Ruleloom Lab</h1>");
    expect(html).toContain("aria-label=\"Rule 30 preset\"");
    expect(html).toContain("aria-label=\"Rule 90 preset\"");
    expect(html).toContain("aria-label=\"Rule 110 preset\"");
    expect(html).toContain("aria-label=\"Rule 184 preset\"");
    expect(html).toContain("aria-label=\"Rule table\"");
    expect(html).toContain("role=\"grid\"");
    expect(html).toContain("role=\"gridcell\"");
    expect(html).toContain("data-action=\"copy-text\"");
    expect(html).toContain("Copy text");
    expect(html).toContain("data-action=\"copy-svg\"");
    expect(html).toContain("Copy SVG");
    expect(html).toContain("data-action=\"copy-rle\"");
    expect(html).toContain("Copy RLE");
    expect(html).toContain('<select id="boundaryMode"');
    expect(html).toContain("Fixed zero edges");
    expect(html).toContain("Wrapped circular edges");
    expect(html).toContain("Compare with rule");
    expect(html).toContain('id="comparisonRule"');
    expect(html).toContain("First differing generation");
    expect(html).toContain("Total differing cells");
  });

  it("renders deterministic rule comparison summary for the current settings", () => {
    const html = createAppHtml({
      rule: 30,
      width: 15,
      generations: 5,
      seedMode: "center",
      boundaryMode: "fixed"
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
    expect(resolveKeyboardShortcut({ key: " " })).toEqual({ type: "toggleRun" });
    expect(resolveKeyboardShortcut({ key: "ArrowRight" })).toEqual({ type: "step" });
    expect(resolveKeyboardShortcut({ key: "." })).toEqual({ type: "step" });
    expect(resolveKeyboardShortcut({ key: "r" })).toEqual({ type: "reset" });
    expect(resolveKeyboardShortcut({ key: "R" })).toEqual({ type: "reset" });
    expect(resolveKeyboardShortcut({ key: "1" })).toEqual({ type: "preset", rule: 30 });
    expect(resolveKeyboardShortcut({ key: "2" })).toEqual({ type: "preset", rule: 90 });
    expect(resolveKeyboardShortcut({ key: "3" })).toEqual({ type: "preset", rule: 110 });
    expect(resolveKeyboardShortcut({ key: "4" })).toEqual({ type: "preset", rule: 184 });
    expect(resolveKeyboardShortcut({ key: "5" })).toBeUndefined();
  });

  it("does not resolve shortcuts while typing in form controls", () => {
    for (const tagName of ["input", "select", "textarea", "button"]) {
      expect(resolveKeyboardShortcut({ key: " ", targetTagName: tagName })).toBeUndefined();
      expect(resolveKeyboardShortcut({ key: "1", targetTagName: tagName })).toBeUndefined();
    }
  });

  it("renders boundary mode status readback", () => {
    const html = createAppHtml({
      rule: 30,
      width: 15,
      generations: 5,
      seedMode: "center",
      boundaryMode: "wrap"
    });

    expect(html).toContain("Wrapped edges");
    expect(html).toContain('<option value="wrap" selected>Wrapped circular edges</option>');
  });

  it("renders preset explanations near the preset controls", () => {
    const html = createAppHtml();

    expect(html).toContain('class="preset-explanations"');
    for (const preset of getPresetExplanations()) {
      expect(html).toContain(`data-preset-explanation="${preset.rule}"`);
      expect(html).toContain(`<strong>${preset.label}</strong>`);
      expect(html).toContain(preset.explanation);
      expect(html.indexOf(`data-preset="${preset.rule}"`)).toBeLessThan(
        html.indexOf(`data-preset-explanation="${preset.rule}"`)
      );
    }
  });

  it("shows rule table neighborhoods from 111 to 000", () => {
    const html = createAppHtml();

    for (const neighborhood of ["111", "110", "101", "100", "011", "010", "001", "000"]) {
      expect(html).toContain(`<code>${neighborhood}</code>`);
    }
  });

  it("copies SVG for the current visible generations", async () => {
    const writeText = vi.fn<[(value: string) => Promise<void>]>().mockResolvedValue(undefined);

    await copySvgForSettings(
      {
        rule: 90,
        width: 15,
        generations: 80,
        seedMode: "center"
      },
      3,
      writeText
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
    const writeText = vi.fn<[(value: string) => Promise<void>]>().mockResolvedValue(undefined);

    await copyTextForSettings(
      {
        rule: 90,
        width: 15,
        generations: 80,
        seedMode: "center",
        boundaryMode: "fixed"
      },
      3,
      writeText
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
    const writeText = vi.fn<[(value: string) => Promise<void>]>().mockResolvedValue(undefined);

    await copyRleForSettings(
      {
        rule: 90,
        width: 15,
        generations: 80,
        seedMode: "center",
        boundaryMode: "fixed"
      },
      3,
      writeText
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
});
