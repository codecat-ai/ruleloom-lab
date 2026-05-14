import type { AutomatonSettings, Bit } from "./automata";

export interface TeacherNotesComparisonSummary {
  primaryRule: number;
  comparisonRule: number;
  firstDifferingGeneration: number | null;
  totalDifferingCells: number;
  differingCellsByGeneration: number[];
}

export interface TeacherNotesContext {
  source: "preset" | "gallery" | "lesson";
  title: string;
  description?: string;
}

export interface TeacherNotesRuleTableRow {
  neighborhood: string;
  result: Bit;
}

export interface TeacherNotesInput {
  settings: AutomatonSettings;
  comparison: TeacherNotesComparisonSummary;
  context?: TeacherNotesContext;
  ruleTable: TeacherNotesRuleTableRow[];
  rows: string[];
  prompts?: string[];
}

export interface TeacherNotesPrintTarget {
  document: {
    open: () => void;
    write: (value: string) => void;
    close: () => void;
  };
  focus?: () => void;
  print: () => void;
}

export interface TeacherNotesPrintOptions {
  openPrintTarget?: () => TeacherNotesPrintTarget | null;
}

export function formatTeacherNotesHtml(input: TeacherNotesInput): string {
  const prompts = input.prompts?.filter((prompt) => prompt.trim() !== "") ?? [];
  const context = input.context;

  return `<html lang="en">
<head>
<meta charset="utf-8">
<title>Ruleloom Lab teacher notes</title>
<style>
body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.45;color:#111827;margin:2rem;}
h1,h2{margin:0 0 .5rem;}
section{break-inside:avoid;margin:1.25rem 0;}
dl{display:grid;grid-template-columns:max-content 1fr;gap:.35rem 1rem;}
dt{font-weight:700;}
dd{margin:0;}
table{border-collapse:collapse;width:100%;}
th,td{border:1px solid #9ca3af;padding:.35rem;text-align:left;}
pre{border:1px solid #9ca3af;padding:.75rem;overflow-wrap:anywhere;white-space:pre-wrap;}
@media print{body{margin:1rem;}button{display:none;}}
</style>
</head>
<body>
<main>
<h1>Ruleloom Lab teacher notes</h1>
${
  context
    ? `<section aria-label="Selected context">
<h2>${escapeHtml(context.title)}</h2>
<p>${escapeHtml(context.source)}${context.description ? `: ${escapeHtml(context.description)}` : ""}</p>
</section>`
    : ""
}
<section aria-label="Settings summary">
<h2>Setup</h2>
<dl>
<dt>Rule</dt><dd>${input.settings.rule}</dd>
<dt>Width</dt><dd>${input.settings.width} cells</dd>
<dt>Generations</dt><dd>${input.settings.generations} rows</dd>
<dt>Seed</dt><dd>${escapeHtml(formatSeed(input.settings))}</dd>
<dt>Boundary</dt><dd>${formatBoundary(input.settings.boundaryMode)}</dd>
</dl>
</section>
<section aria-label="Comparison summary">
<h2>Comparison</h2>
<dl>
<dt>Comparison</dt><dd>Rule ${input.comparison.primaryRule} vs Rule ${input.comparison.comparisonRule}</dd>
<dt>First differing generation</dt><dd>${formatFirstDifference(input.comparison.firstDifferingGeneration)}</dd>
<dt>Total differing cells</dt><dd>${input.comparison.totalDifferingCells} ${input.comparison.totalDifferingCells === 1 ? "cell" : "cells"}</dd>
<dt>Differences by generation</dt><dd>${input.comparison.differingCellsByGeneration.join(", ")}</dd>
</dl>
</section>
<section aria-label="Rule table">
<h2>Rule table</h2>
<table>
<thead><tr><th>Neighborhood</th><th>Result</th></tr></thead>
<tbody>${input.ruleTable.map((row) => `<tr><td><code>${escapeHtml(row.neighborhood)}</code></td><td>${row.result}</td></tr>`).join("")}</tbody>
</table>
</section>
<section aria-label="Generated pattern">
<h2>Generated rows</h2>
<pre aria-label="Generated rows">${escapeHtml(input.rows.join("\n"))}</pre>
</section>
${
  prompts.length > 0
    ? `<section aria-label="Discussion prompts">
<h2>Discussion prompts</h2>
<ol>${prompts.map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join("")}</ol>
</section>`
    : ""
}
</main>
</body>
</html>`;
}

export function createTeacherNotesDocument(notesHtml: string): string {
  return `<!doctype html>\n${notesHtml}`;
}

export function printTeacherNotes(
  notesHtml: string,
  options: TeacherNotesPrintOptions = {},
): boolean {
  const openPrintTarget =
    options.openPrintTarget ??
    (() => {
      if (typeof globalThis.window === "undefined") {
        return null;
      }
      return globalThis.window.open("", "_blank", "noopener,noreferrer");
    });
  const target = openPrintTarget();

  if (!target) {
    return false;
  }

  target.document.open();
  target.document.write(createTeacherNotesDocument(notesHtml));
  target.document.close();
  target.focus?.();
  target.print();
  return true;
}

function formatSeed(settings: AutomatonSettings): string {
  if (settings.seedMode === "random") {
    return `random ${settings.randomSeed ?? 1}`;
  }

  if (settings.seedMode === "custom") {
    return `custom ${settings.customSeed ?? ""}`.trimEnd();
  }

  return "center";
}

function formatBoundary(
  boundaryMode: AutomatonSettings["boundaryMode"],
): string {
  return boundaryMode === "wrap"
    ? "wrapped circular edges"
    : "fixed zero edges";
}

function formatFirstDifference(
  firstDifferingGeneration: number | null,
): string {
  return firstDifferingGeneration === null
    ? "None"
    : `Generation ${firstDifferingGeneration}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
