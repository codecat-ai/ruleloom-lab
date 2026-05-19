import type { LessonPath } from "./lessonPaths";

export type PacingPresetId = "bell-ringer" | "standard" | "workshop";

export interface PacingPreset {
  id: PacingPresetId;
  label: string;
  totalMinutes: number;
  audience: string;
}

export interface PacedLessonPathStep {
  stepId: string;
  title: string;
  suggestedMinutes: number;
  startMinute: number;
  endMinute: number;
  phaseLabel: string;
  facilitatorCue: string;
}

export interface PacedLessonPath {
  lessonId: string;
  lessonTitle: string;
  preset: PacingPreset;
  totalMinutes: number;
  steps: PacedLessonPathStep[];
}

const PACING_PRESETS: readonly PacingPreset[] = [
  {
    id: "bell-ringer",
    label: "Bell-ringer",
    totalMinutes: 12,
    audience: "Short 10-12 minute opening activity",
  },
  {
    id: "standard",
    label: "Standard",
    totalMinutes: 24,
    audience: "Normal classroom lesson path",
  },
  {
    id: "workshop",
    label: "Workshop",
    totalMinutes: 45,
    audience: "Longer 35-45 minute exploration",
  },
] as const;

export function listPacingPresets(): PacingPreset[] {
  return PACING_PRESETS.map(copyPacingPreset);
}

export function getPacingPreset(id: string): PacingPreset | null {
  const preset = PACING_PRESETS.find((candidate) => candidate.id === id);
  return preset ? copyPacingPreset(preset) : null;
}

export function applyPacingPresetToLessonPath(
  path: LessonPath,
  presetId: string,
): PacedLessonPath {
  const preset = requirePacingPreset(presetId);
  const durations = distributeDurations(preset.totalMinutes, path.steps.length);
  let startMinute = 0;

  return {
    lessonId: path.id,
    lessonTitle: path.title,
    preset,
    totalMinutes: preset.totalMinutes,
    steps: path.steps.map((step, index) => {
      const suggestedMinutes = durations[index] ?? 0;
      const endMinute = startMinute + suggestedMinutes;
      const phaseLabel = resolvePhaseLabel(index, path.steps.length);
      const pacedStep = {
        stepId: step.galleryExampleId ?? `step-${index + 1}`,
        title: `Step ${index + 1}`,
        suggestedMinutes,
        startMinute,
        endMinute,
        phaseLabel,
        facilitatorCue: formatFacilitatorCue(
          preset.id,
          phaseLabel,
          step.prompt,
        ),
      };
      startMinute = endMinute;
      return pacedStep;
    }),
  };
}

export function formatPacingGuide(pacing: PacedLessonPath): string {
  const lines = [
    "Ruleloom Lab pacing guide",
    `Lesson: ${normalizePlainText(pacing.lessonTitle)}`,
    `Preset: ${pacing.preset.label}`,
    `Total: ${pacing.totalMinutes} minutes`,
    `Use case: ${pacing.preset.audience}`,
  ];

  for (const [index, step] of pacing.steps.entries()) {
    lines.push(
      "",
      `${index + 1}. ${step.startMinute}-${step.endMinute} min | ${step.phaseLabel} | ${step.title}`,
      `Cue: ${step.facilitatorCue}`,
    );
  }

  return lines.join("\n");
}

function requirePacingPreset(id: string): PacingPreset {
  const preset = getPacingPreset(id);

  if (!preset) {
    throw new Error(
      `Unknown pacing preset "${id}". Choose bell-ringer, standard, or workshop.`,
    );
  }

  return preset;
}

function copyPacingPreset(preset: PacingPreset): PacingPreset {
  return { ...preset };
}

function distributeDurations(
  totalMinutes: number,
  stepCount: number,
): number[] {
  if (stepCount <= 0) {
    return [];
  }

  const baseDuration = Math.max(1, Math.floor(totalMinutes / stepCount));
  const durations = Array.from({ length: stepCount }, () => baseDuration);
  let remainingMinutes = Math.max(0, totalMinutes - baseDuration * stepCount);

  for (
    let index = 0;
    index < durations.length && remainingMinutes > 0;
    index += 1
  ) {
    durations[index] += 1;
    remainingMinutes -= 1;
  }

  return durations;
}

function resolvePhaseLabel(index: number, stepCount: number): string {
  if (index === 0) {
    return "Explore";
  }

  if (index === stepCount - 1) {
    return "Reflect";
  }

  return "Compare";
}

function formatFacilitatorCue(
  presetId: PacingPresetId,
  phaseLabel: string,
  prompt: string,
): string {
  const normalizedPrompt = normalizePlainText(prompt);

  if (presetId === "bell-ringer") {
    if (phaseLabel === "Explore") {
      return `Quick scan: ${normalizedPrompt}`;
    }

    if (phaseLabel === "Reflect") {
      return `Quick share-out: ${normalizedPrompt}`;
    }

    return `Quick compare: ${normalizedPrompt}`;
  }

  if (presetId === "workshop") {
    if (phaseLabel === "Explore") {
      return `Deep dive: ${normalizedPrompt}`;
    }

    if (phaseLabel === "Reflect") {
      return `Synthesis discussion: ${normalizedPrompt}`;
    }

    return `Small-group comparison: ${normalizedPrompt}`;
  }

  return `Facilitate: ${normalizedPrompt}`;
}

function normalizePlainText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
