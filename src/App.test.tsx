import { describe, expect, it, vi } from "vitest";
import { copySvgForSettings, createAppHtml } from "./App";

describe("App", () => {
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
