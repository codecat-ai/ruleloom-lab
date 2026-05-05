import { describe, expect, it } from "vitest";
import { exportPatternSvg } from "./svgExport";

describe("SVG pattern export", () => {
  it("exports a standalone deterministic SVG for alive cells only", () => {
    const svg = exportPatternSvg(
      {
        rule: 90,
        width: 15,
        generations: 3,
        seedMode: "center"
      },
      { cellSize: 4 }
    );

    expect(svg).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="ruleloom-title ruleloom-desc" width="60" height="12" viewBox="0 0 60 12">
        <title id="ruleloom-title">Ruleloom Lab Rule 90</title>
        <desc id="ruleloom-desc">Elementary cellular automaton pattern for rule 90, 15 cells wide, 3 generations, center seed.</desc>
        <metadata>{&quot;app&quot;:&quot;Ruleloom Lab&quot;,&quot;rule&quot;:90,&quot;width&quot;:15,&quot;generations&quot;:3,&quot;seedMode&quot;:&quot;center&quot;}</metadata>
        <rect width="60" height="12" fill="#ffffff"/>
        <g fill="#1f2933">
          <rect x="28" y="0" width="4" height="4"/>
          <rect x="24" y="4" width="4" height="4"/>
          <rect x="32" y="4" width="4" height="4"/>
          <rect x="20" y="8" width="4" height="4"/>
          <rect x="36" y="8" width="4" height="4"/>
        </g>
      </svg>"
    `);
  });

  it("escapes XML text in title, description, and metadata", () => {
    const svg = exportPatternSvg(
      {
        rule: 30,
        width: 15,
        generations: 1,
        seedMode: "custom",
        customSeed: `1<&"'>`
      },
      {
        cellSize: 2,
        description: `custom <seed> & "quote"`,
        title: `Rule <30> & "copy"`
      }
    );

    expect(svg).toContain("<title id=\"ruleloom-title\">Rule &lt;30&gt; &amp; &quot;copy&quot;</title>");
    expect(svg).toContain(
      "<desc id=\"ruleloom-desc\">custom &lt;seed&gt; &amp; &quot;quote&quot;</desc>"
    );
    expect(svg).toContain("&quot;customSeed&quot;:&quot;1&lt;&amp;\\&quot;&apos;&gt;&quot;");
  });
});
