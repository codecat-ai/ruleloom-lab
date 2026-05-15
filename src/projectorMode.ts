export interface ProjectorModeStatusSettings {
  rule: number;
  width: number;
  generations: number;
  boundaryModeLabel: string;
}

export function resolveProjectorModeButtonLabel(enabled: boolean): string {
  return enabled ? "Exit projector mode" : "Projector mode";
}

export function resolveProjectorModeRootClassName(enabled: boolean): string {
  return enabled ? "shell projector-mode" : "shell";
}

export function resolveProjectorModeStatusText(
  enabled: boolean,
  settings: ProjectorModeStatusSettings,
): string {
  if (!enabled) {
    return "Projector mode is off. Full controls are visible.";
  }

  return `Projector mode is on. Showing Rule ${settings.rule}, ${settings.width} cells, ${settings.generations} rows, ${settings.boundaryModeLabel}.`;
}
