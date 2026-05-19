import type { AutomatonSettings } from "./automata";
import {
  sortGenerationAnnotations,
  type GenerationAnnotation,
} from "./generationAnnotations";
import type { TimingCue } from "./timingCues";

export interface SessionSummaryComparison {
  primaryRule: number;
  comparisonRule: number;
  firstDifferingGeneration: number | null;
  totalDifferingCells: number;
}

export interface SessionSummaryContext {
  source: "preset" | "gallery" | "lesson";
  title?: string;
  summary?: string;
  description?: string;
  prompt?: string;
}

export interface SessionSummaryInput {
  settings: AutomatonSettings & { comparisonRule?: number };
  comparison?: SessionSummaryComparison;
  context?: SessionSummaryContext;
  timingCues?: readonly TimingCue[];
  annotations?: readonly GenerationAnnotation[];
  prompts?: readonly string[];
}

const MAX_TITLE_LENGTH = 120;
const MAX_NOTE_LENGTH = 180;
const MAX_PROMPT_LENGTH = 220;
const MAX_SEED_LENGTH = 160;

export function formatSessionSummary(input: SessionSummaryInput): string {
  const lines = [
    "Ruleloom Lab session summary",
    "",
    "Setup",
    `- Active rule: Rule ${formatInteger(input.settings.rule)}`,
  ];

  const comparisonRule =
    input.comparison?.comparisonRule ?? input.settings.comparisonRule;

  if (comparisonRule !== undefined) {
    lines.push(
      `- Comparison: Rule ${formatInteger(input.settings.rule)} vs Rule ${formatInteger(comparisonRule)}`,
    );
  }

  if (input.comparison) {
    lines.push(
      `- First differing generation: ${formatFirstDifference(input.comparison.firstDifferingGeneration)}`,
      `- Total differing cells: ${formatInteger(input.comparison.totalDifferingCells)}`,
    );
  }

  lines.push(
    `- Width: ${formatInteger(input.settings.width)} cells`,
    `- Generations: ${formatInteger(input.settings.generations)} rows`,
    `- Seed: ${formatSeed(input.settings)}`,
    `- Boundary: ${formatBoundary(input.settings.boundaryMode)}`,
    "",
    "Context",
  );

  lines.push(...formatContext(input.context, input.prompts));
  lines.push(...formatTimingCues(input.timingCues));
  lines.push("", "Annotations", ...formatAnnotations(input.annotations));
  lines.push(
    "",
    "Export hints",
    "- PNG: Download PNG captures the currently visible rows.",
    "- SVG: Copy SVG produces a standalone vector snapshot.",
    "- Plain text: Copy text produces a monospaced pattern with setup metadata.",
    "- RLE: Copy RLE produces Ruleloom RLE that can be pasted back into Import RLE.",
    "- Teacher notes: Print teacher notes creates a printable facilitator handout.",
  );

  return lines.join("\n");
}

function formatContext(
  context: SessionSummaryContext | undefined,
  prompts: readonly string[] | undefined,
): string[] {
  const lines: string[] = [];

  if (context) {
    lines.push(`- Source: ${normalizeText(context.source, MAX_TITLE_LENGTH)}`);
    pushOptionalLine(lines, "Title", context.title, MAX_TITLE_LENGTH);
    pushOptionalLine(
      lines,
      "Summary",
      context.summary ?? context.description,
      MAX_NOTE_LENGTH,
    );
    pushOptionalLine(lines, "Prompt", context.prompt, MAX_PROMPT_LENGTH);
  }

  const normalizedPrompts =
    prompts
      ?.map((prompt) => normalizeText(prompt, MAX_PROMPT_LENGTH))
      .filter((prompt) => prompt.length > 0) ?? [];

  if (!context && normalizedPrompts.length === 0) {
    return ["- None"];
  }

  for (const prompt of normalizedPrompts) {
    lines.push(`- Prompt: ${prompt}`);
  }

  return lines.length > 0 ? lines : ["- None"];
}

function formatTimingCues(
  timingCues: readonly TimingCue[] | undefined,
): string[] {
  if (!timingCues || timingCues.length === 0) {
    return [];
  }

  return [
    "",
    "Timing cues",
    ...timingCues.map((cue) =>
      [
        `- ${formatInteger(cue.startMinute)}-${formatInteger(cue.endMinute)} min`,
        normalizeText(cue.phaseLabel, MAX_TITLE_LENGTH),
        normalizeText(cue.title, MAX_TITLE_LENGTH),
        normalizeText(cue.facilitatorPrompt, MAX_PROMPT_LENGTH),
      ]
        .filter((part) => part.length > 0)
        .join(" | "),
    ),
  ];
}

function formatAnnotations(
  annotations: readonly GenerationAnnotation[] | undefined,
): string[] {
  if (!annotations || annotations.length === 0) {
    return ["- None"];
  }

  return sortGenerationAnnotations(annotations).map((annotation) => {
    const label = normalizeText(annotation.label, MAX_TITLE_LENGTH);
    const note = normalizeText(annotation.note, MAX_NOTE_LENGTH);
    return note
      ? `- Generation ${formatInteger(annotation.generation)}: ${label} - ${note}`
      : `- Generation ${formatInteger(annotation.generation)}: ${label}`;
  });
}

function pushOptionalLine(
  lines: string[],
  label: string,
  value: string | undefined,
  maxLength: number,
): void {
  const normalized = normalizeText(value, maxLength);

  if (normalized.length > 0) {
    lines.push(`- ${label}: ${normalized}`);
  }
}

function formatSeed(settings: AutomatonSettings): string {
  if (settings.seedMode === "random") {
    return `random ${formatInteger(settings.randomSeed ?? 1)}`;
  }

  if (settings.seedMode === "custom") {
    const seed = normalizeText(settings.customSeed, MAX_SEED_LENGTH);
    return seed ? `custom ${seed}` : "custom";
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

function formatFirstDifference(value: number | null): string {
  return value === null ? "None" : `Generation ${formatInteger(value)}`;
}

function formatInteger(value: number): string {
  return Number.isFinite(value) ? String(Math.trunc(value)) : "";
}

function normalizeText(value: string | undefined, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}
