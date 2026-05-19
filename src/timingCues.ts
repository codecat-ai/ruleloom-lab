import type { LessonPathStep } from "./lessonPaths";

export interface TimingCue {
  stepId: string;
  title: string;
  suggestedMinutes: number;
  startMinute: number;
  endMinute: number;
  phaseLabel: string;
  facilitatorPrompt: string;
}

export interface TimingCueScheduleInput {
  lessonTitle: string;
  steps: readonly LessonPathStep[];
  totalMinutes?: number;
}

export interface TimingCueSheetInput {
  lessonTitle: string;
  totalMinutes: number;
  schedule: readonly TimingCue[];
}

export const DEFAULT_TIMING_CUE_TOTAL_MINUTES = 24;
export const MAX_TIMING_CUE_TOTAL_MINUTES = 180;

export function generateTimingCueSchedule(
  input: TimingCueScheduleInput,
): TimingCue[] {
  const totalMinutes = resolveTotalMinutes(input.totalMinutes);

  if (input.steps.length === 0) {
    return [];
  }

  const durations = distributeDurations(totalMinutes, input.steps.length);
  let startMinute = 0;

  return input.steps.map((step, index) => {
    const suggestedMinutes = durations[index];
    const endMinute = startMinute + suggestedMinutes;
    const cue = {
      stepId: resolveStepId(step, index),
      title: `Step ${index + 1}`,
      suggestedMinutes,
      startMinute,
      endMinute,
      phaseLabel: resolvePhaseLabel(index, input.steps.length),
      facilitatorPrompt: normalizePlainText(step.prompt),
    };
    startMinute = endMinute;
    return cue;
  });
}

export function formatTimingCueSheet(input: TimingCueSheetInput): string {
  const lines = [
    "Ruleloom Lab timing cues",
    `Lesson: ${normalizePlainText(input.lessonTitle)}`,
    `Total: ${input.totalMinutes} minutes`,
  ];

  for (const [index, cue] of input.schedule.entries()) {
    lines.push(
      "",
      `${index + 1}. ${cue.startMinute}-${cue.endMinute} min | ${cue.phaseLabel} | ${cue.title}`,
      `Prompt: ${cue.facilitatorPrompt}`,
    );
  }

  return lines.join("\n");
}

export function resolveTimingCueTotalMinutes(totalMinutes?: number): number {
  return resolveTotalMinutes(totalMinutes);
}

function resolveTotalMinutes(totalMinutes?: number): number {
  if (totalMinutes === undefined) {
    return DEFAULT_TIMING_CUE_TOTAL_MINUTES;
  }

  if (
    !Number.isFinite(totalMinutes) ||
    totalMinutes < 1 ||
    totalMinutes > MAX_TIMING_CUE_TOTAL_MINUTES
  ) {
    throw new Error("totalMinutes must be a finite number from 1 to 180.");
  }

  return Math.floor(totalMinutes);
}

function distributeDurations(
  totalMinutes: number,
  stepCount: number,
): number[] {
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

function resolveStepId(step: LessonPathStep, index: number): string {
  return step.galleryExampleId ?? `step-${index + 1}`;
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

function normalizePlainText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
