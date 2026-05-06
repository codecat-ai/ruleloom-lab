import { describe, expect, it, vi } from "vitest";
import { copySvgForSettings, createAppHtml, getPresetExplanations } from "./App";

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
    expect(html).toContain("data-action=\"copy-svg\"");
    expect(html).toContain("Copy SVG");
    expect(html).toContain('<select id="boundaryMode"');
    expect(html).toContain("Fixed zero edges");
    expect(html).toContain("Wrapped circular edges");
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
});
