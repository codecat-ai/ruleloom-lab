import {
  type AutomatonSettings,
  clamp,
  clampSettings,
  generateAutomaton,
} from "./automata";

export interface PngCanvasContext {
  fillStyle: string;
  fillRect(x: number, y: number, width: number, height: number): void;
}

export interface PngCanvasHandle {
  context: PngCanvasContext;
  encodePng?: () => Promise<string> | string;
}

export interface PngCanvasFactory {
  createCanvas(width: number, height: number): PngCanvasHandle;
}

export interface PngExportOptions {
  aliveColor?: string;
  backgroundColor?: string;
  cellSize?: number;
  maxPixelDimension?: number;
  visibleGenerations?: number;
}

export interface PngExportPayload {
  dataUrl: string;
  filename: string;
  height: number;
  width: number;
}

const DEFAULT_ALIVE_COLOR = "#1f2933";
const DEFAULT_BACKGROUND_COLOR = "#ffffff";
const DEFAULT_CELL_SIZE = 8;
const DEFAULT_MAX_PIXEL_DIMENSION = 1024;

export async function exportPatternPngDataUrl(
  settings: AutomatonSettings,
  factory: PngCanvasFactory,
  options: PngExportOptions = {},
): Promise<PngExportPayload> {
  const normalized = clampSettings({
    ...settings,
    generations: options.visibleGenerations ?? settings.generations,
  });
  const rows = generateAutomaton(normalized);
  const cellSize = resolveCellSize(normalized.width, rows.length, options);
  const width = normalized.width * cellSize;
  const height = rows.length * cellSize;
  const canvas = factory.createCanvas(width, height);

  canvas.context.fillStyle =
    options.backgroundColor ?? DEFAULT_BACKGROUND_COLOR;
  canvas.context.fillRect(0, 0, width, height);
  canvas.context.fillStyle = options.aliveColor ?? DEFAULT_ALIVE_COLOR;

  rows.forEach((row, rowIndex) => {
    row.forEach((bit, columnIndex) => {
      if (bit === 1) {
        canvas.context.fillRect(
          columnIndex * cellSize,
          rowIndex * cellSize,
          cellSize,
          cellSize,
        );
      }
    });
  });

  if (!canvas.encodePng) {
    throw new Error("PNG export is unavailable in this browser.");
  }

  const dataUrl = await canvas.encodePng();
  if (!dataUrl.startsWith("data:image/png")) {
    throw new Error("PNG export is unavailable in this browser.");
  }

  return {
    dataUrl,
    filename: createPatternPngFilename(normalized),
    height,
    width,
  };
}

export function createPatternPngFilename(settings: AutomatonSettings): string {
  const normalized = clampSettings(settings);
  const parts = [
    "ruleloom",
    "rule",
    String(normalized.rule),
    `w${normalized.width}`,
    `g${normalized.generations}`,
    describeSeed(normalized),
    normalized.boundaryMode ?? "fixed",
  ];

  return `${parts.map(slugify).filter(Boolean).join("-")}.png`;
}

function resolveCellSize(
  width: number,
  generations: number,
  options: PngExportOptions,
): number {
  const requestedCellSize = clamp(
    options.cellSize ?? DEFAULT_CELL_SIZE,
    1,
    128,
  );
  const maxPixelDimension = Math.max(
    1,
    Math.floor(options.maxPixelDimension ?? DEFAULT_MAX_PIXEL_DIMENSION),
  );
  const largestAxis = Math.max(width, generations);
  const maxCellSize = Math.max(1, Math.floor(maxPixelDimension / largestAxis));

  return Math.min(requestedCellSize, maxCellSize);
}

function describeSeed(settings: AutomatonSettings): string {
  if (settings.seedMode === "random") {
    return `random-${settings.randomSeed ?? 1}`;
  }

  if (settings.seedMode === "custom") {
    return `custom-${settings.customSeed ?? ""}`;
  }

  return "center";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}
