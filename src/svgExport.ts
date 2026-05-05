import { type AutomatonSettings, clamp, clampSettings, generateAutomaton } from "./automata";

export interface SvgExportOptions {
  cellSize?: number;
  description?: string;
  title?: string;
}

const DEFAULT_CELL_SIZE = 8;

export function exportPatternSvg(settings: AutomatonSettings, options: SvgExportOptions = {}): string {
  const normalized = clampSettings(settings);
  const cellSize = clamp(options.cellSize ?? DEFAULT_CELL_SIZE, 1, 128);
  const rows = generateAutomaton(normalized);
  const width = normalized.width * cellSize;
  const height = rows.length * cellSize;
  const title = options.title ?? `Ruleloom Lab Rule ${normalized.rule}`;
  const description =
    options.description ??
    `Elementary cellular automaton pattern for rule ${normalized.rule}, ${normalized.width} cells wide, ${rows.length} generations, ${describeSeed(normalized)}.`;
  const metadata = JSON.stringify(createMetadata(normalized, rows.length));
  const rects = rows.flatMap((row, rowIndex) =>
    row.flatMap((bit, columnIndex) =>
      bit === 1
        ? [
            `    <rect x="${columnIndex * cellSize}" y="${rowIndex * cellSize}" width="${cellSize}" height="${cellSize}"/>`
          ]
        : []
    )
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="ruleloom-title ruleloom-desc" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `  <title id="ruleloom-title">${escapeXml(title)}</title>`,
    `  <desc id="ruleloom-desc">${escapeXml(description)}</desc>`,
    `  <metadata>${escapeXml(metadata)}</metadata>`,
    `  <rect width="${width}" height="${height}" fill="#ffffff"/>`,
    '  <g fill="#1f2933">',
    ...rects,
    "  </g>",
    "</svg>"
  ].join("\n");
}

function createMetadata(settings: AutomatonSettings, generations: number): Record<string, number | string> {
  const metadata: Record<string, number | string> = {
    app: "Ruleloom Lab",
    rule: settings.rule,
    width: settings.width,
    generations,
    seedMode: settings.seedMode
  };

  if (settings.seedMode === "random" && settings.randomSeed !== undefined) {
    metadata.randomSeed = settings.randomSeed;
  }

  if (settings.seedMode === "custom" && settings.customSeed !== undefined) {
    metadata.customSeed = settings.customSeed;
  }

  return metadata;
}

function describeSeed(settings: AutomatonSettings): string {
  if (settings.seedMode === "random") {
    return `deterministic random seed ${settings.randomSeed ?? 1}`;
  }

  if (settings.seedMode === "custom") {
    return "custom seed";
  }

  return "center seed";
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
