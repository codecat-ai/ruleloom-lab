import { describe, expect, it } from "vitest";
import {
  resolveProjectorModeButtonLabel,
  resolveProjectorModeRootClassName,
  resolveProjectorModeStatusText,
} from "./projectorMode";

describe("projector mode", () => {
  it("resolves toggle labels from the current mode", () => {
    expect(resolveProjectorModeButtonLabel(false)).toBe("Projector mode");
    expect(resolveProjectorModeButtonLabel(true)).toBe("Exit projector mode");
  });

  it("resolves root class names for the app shell", () => {
    expect(resolveProjectorModeRootClassName(false)).toBe("shell");
    expect(resolveProjectorModeRootClassName(true)).toBe(
      "shell projector-mode",
    );
  });

  it("resolves facilitator-friendly status text", () => {
    expect(
      resolveProjectorModeStatusText(false, {
        rule: 30,
        width: 61,
        generations: 80,
        boundaryModeLabel: "Fixed zero edges",
      }),
    ).toBe("Projector mode is off. Full controls are visible.");

    expect(
      resolveProjectorModeStatusText(true, {
        rule: 90,
        width: 61,
        generations: 80,
        boundaryModeLabel: "Wrapped edges",
      }),
    ).toBe(
      "Projector mode is on. Showing Rule 90, 61 cells, 80 rows, Wrapped edges.",
    );
  });
});
