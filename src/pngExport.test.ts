import { describe, expect, it, vi } from "vitest";
import {
  createPatternPngFilename,
  exportPatternPngDataUrl,
  type PngCanvasContext,
  type PngCanvasFactory,
} from "./pngExport";

function createRecordingFactory(
  dataUrl: string | null = "data:image/png;base64,ruleloom",
): {
  factory: PngCanvasFactory;
  fills: Array<{
    color: string;
    height: number;
    width: number;
    x: number;
    y: number;
  }>;
  sizes: Array<{ height: number; width: number }>;
} {
  const fills: Array<{
    color: string;
    height: number;
    width: number;
    x: number;
    y: number;
  }> = [];
  const sizes: Array<{ height: number; width: number }> = [];

  const factory: PngCanvasFactory = {
    createCanvas(width, height) {
      sizes.push({ width, height });
      const context: PngCanvasContext = {
        fillStyle: "",
        fillRect(x, y, rectWidth, rectHeight) {
          fills.push({
            color: this.fillStyle,
            x,
            y,
            width: rectWidth,
            height: rectHeight,
          });
        },
      };

      return {
        context,
        encodePng:
          dataUrl === null ? undefined : vi.fn().mockResolvedValue(dataUrl),
      };
    },
  };

  return { factory, fills, sizes };
}

describe("PNG pattern export", () => {
  it("renders the visible automaton rows to deterministic PNG canvas dimensions", async () => {
    const { factory, fills, sizes } = createRecordingFactory();

    const payload = await exportPatternPngDataUrl(
      {
        rule: 90,
        width: 15,
        generations: 80,
        seedMode: "center",
        boundaryMode: "fixed",
      },
      factory,
      { cellSize: 4, visibleGenerations: 3 },
    );

    expect(payload).toEqual({
      dataUrl: "data:image/png;base64,ruleloom",
      filename: "ruleloom-rule-90-w15-g3-center-fixed.png",
      height: 12,
      width: 60,
    });
    expect(sizes).toEqual([{ width: 60, height: 12 }]);
    expect(fills).toEqual([
      { color: "#ffffff", x: 0, y: 0, width: 60, height: 12 },
      { color: "#1f2933", x: 28, y: 0, width: 4, height: 4 },
      { color: "#1f2933", x: 24, y: 4, width: 4, height: 4 },
      { color: "#1f2933", x: 32, y: 4, width: 4, height: 4 },
      { color: "#1f2933", x: 20, y: 8, width: 4, height: 4 },
      { color: "#1f2933", x: 36, y: 8, width: 4, height: 4 },
    ]);
  });

  it("creates metadata-safe filenames for download payloads", () => {
    expect(
      createPatternPngFilename({
        rule: 30,
        width: 31,
        generations: 8,
        seedMode: "custom",
        customSeed: "10/01 <seed>",
        boundaryMode: "wrap",
      }),
    ).toBe("ruleloom-rule-30-w31-g8-custom-10-01-seed-wrap.png");
  });

  it("clamps requested cell size and keeps larger boards inside the max pixel dimension", async () => {
    const { factory, sizes, fills } = createRecordingFactory();

    const payload = await exportPatternPngDataUrl(
      {
        rule: 110,
        width: 121,
        generations: 160,
        seedMode: "center",
        boundaryMode: "wrap",
      },
      factory,
      { cellSize: 99, maxPixelDimension: 240 },
    );

    expect(payload.width).toBe(121);
    expect(payload.height).toBe(160);
    expect(sizes).toEqual([{ width: 121, height: 160 }]);
    expect(fills[0]).toEqual({
      color: "#ffffff",
      x: 0,
      y: 0,
      width: 121,
      height: 160,
    });
    expect(fills[1]).toMatchObject({ width: 1, height: 1 });
  });

  it("fails clearly when PNG canvas encoding is unavailable", async () => {
    const { factory } = createRecordingFactory(null);

    await expect(
      exportPatternPngDataUrl(
        {
          rule: 90,
          width: 15,
          generations: 3,
          seedMode: "center",
        },
        factory,
      ),
    ).rejects.toThrow("PNG export is unavailable in this browser.");
  });
});
