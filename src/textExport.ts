import { type AutomatonSettings, clampSettings, generateAutomaton } from "./automata";

export interface TextExportOptions {
  aliveGlyph?: string;
  deadGlyph?: string;
}

const DEFAULT_ALIVE_GLYPH = "#";
const DEFAULT_DEAD_GLYPH = ".";

export function exportPatternText(settings: AutomatonSettings, options: TextExportOptions = {}): string {
  const normalized = clampSettings(settings);
  const aliveGlyph = normalizeGlyph(options.aliveGlyph, DEFAULT_ALIVE_GLYPH);
  const deadGlyph = normalizeGlyph(options.deadGlyph, DEFAULT_DEAD_GLYPH);
  const rows = generateAutomaton(normalized);

  return [
    "# Ruleloom Lab pattern",
    `rule: ${normalized.rule}`,
    `width: ${normalized.width}`,
    `generations: ${rows.length}`,
    `seed: ${describeSeed(normalized)}`,
    `boundary: ${normalized.boundaryMode ?? "fixed"}`,
    "",
    ...rows.map((row) => row.map((bit) => (bit === 1 ? aliveGlyph : deadGlyph)).join(""))
  ].join("\n");
}

function describeSeed(settings: AutomatonSettings): string {
  if (settings.seedMode === "random") {
    return `random ${settings.randomSeed ?? 1}`;
  }

  if (settings.seedMode === "custom") {
    return `custom ${settings.customSeed ?? ""}`.trimEnd();
  }

  return "center";
}

function normalizeGlyph(value: string | undefined, fallback: string): string {
  return value && value.length > 0 ? Array.from(value)[0] : fallback;
}
