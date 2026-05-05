import { describe, expect, it } from "vitest";
import { createAppHtml } from "./App";

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
  });

  it("shows rule table neighborhoods from 111 to 000", () => {
    const html = createAppHtml();

    for (const neighborhood of ["111", "110", "101", "100", "011", "010", "001", "000"]) {
      expect(html).toContain(`<code>${neighborhood}</code>`);
    }
  });
});
