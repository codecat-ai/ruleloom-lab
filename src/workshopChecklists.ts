export interface WorkshopTimingCueInput {
  label?: string | null;
  minutes?: number | null;
  prompt?: string | null;
}

export interface WorkshopChecklistInput {
  title?: string | null;
  durationMinutes?: number | null;
  selectedRules?: readonly (string | null | undefined)[];
  selectedPresetNames?: readonly (string | null | undefined)[];
  lessonPathNames?: readonly (string | null | undefined)[];
  comparisonFocus?: string | null;
  facilitatorNotes?: readonly (string | null | undefined)[];
  timingCues?: readonly WorkshopTimingCueInput[];
  reflectionPrompts?: readonly (string | null | undefined)[];
}

const DEFAULT_DURATION_MINUTES = 30;
const MIN_DURATION_MINUTES = 5;
const MAX_DURATION_MINUTES = 240;
const MAX_TIMING_CUES = 6;
const MAX_TEXT_LENGTH = 180;

export function formatWorkshopChecklist(
  input: WorkshopChecklistInput = {},
): string {
  const durationMinutes = resolveWorkshopDurationMinutes(
    input.durationMinutes ?? undefined,
  );
  const timingCues = resolveTimingCues(input.timingCues, durationMinutes);

  return [
    "# Ruleloom Lab workshop run sheet",
    `Title: ${formatText(input.title, "Untitled workshop")}`,
    `Duration: ${durationMinutes} minutes`,
    "",
    "## Setup",
    `- Rules: ${formatList(input.selectedRules, "Current visible rule")}`,
    `- Presets: ${formatList(input.selectedPresetNames, "Current visible preset")}`,
    `- Lesson paths: ${formatList(input.lessonPathNames, "Current visible lesson path")}`,
    `- Comparison focus: ${formatText(input.comparisonFocus, "Compare the active rule with the selected comparison rule.")}`,
    "",
    "## Facilitator notes",
    ...formatBullets(input.facilitatorNotes, [
      "Review the selected comparison set, lesson path, and teacher notes before starting.",
    ]),
    "",
    "## Timing cues",
    ...timingCues.map(formatTimingCue),
    "",
    "## Checklist",
    "- Apply or restore the selected comparison set before learners arrive.",
    "- Open the selected lesson path and confirm the current visible rule setup.",
    "- Copy teacher notes or this run sheet for the facilitator.",
    "- Leave time for reflection and local export handoff.",
    "",
    "## Reflection prompts",
    ...formatBullets(input.reflectionPrompts, [
      "What pattern evidence should we save?",
      "Which comparison or lesson path should we reuse next time?",
    ]),
  ].join("\n");
}

export function resolveWorkshopDurationMinutes(
  durationMinutes?: number,
): number {
  if (durationMinutes === undefined || !Number.isFinite(durationMinutes)) {
    return DEFAULT_DURATION_MINUTES;
  }

  return Math.min(
    MAX_DURATION_MINUTES,
    Math.max(MIN_DURATION_MINUTES, Math.floor(durationMinutes)),
  );
}

interface ResolvedTimingCue {
  index: number;
  startMinute: number;
  endMinute: number;
  label: string;
  prompt: string;
}

function resolveTimingCues(
  timingCues: readonly WorkshopTimingCueInput[] | undefined,
  durationMinutes: number,
): ResolvedTimingCue[] {
  const normalized = (timingCues ?? [])
    .slice(0, MAX_TIMING_CUES)
    .map((cue) => ({
      label: formatText(cue.label, "Workshop step"),
      minutes: resolveCueMinutes(cue.minutes),
      prompt: formatText(cue.prompt, "Advance the workshop run sheet."),
    }))
    .filter((cue) => cue.minutes > 0);

  if (normalized.length === 0) {
    return [
      {
        index: 1,
        startMinute: 0,
        endMinute: durationMinutes,
        label: "Workshop flow",
        prompt:
          "Facilitate the selected lesson path, comparison focus, and reflection prompts.",
      },
    ];
  }

  const cues: ResolvedTimingCue[] = [];
  let startMinute = 0;

  for (const cue of normalized) {
    if (startMinute >= durationMinutes - 1) {
      break;
    }

    const endMinute = Math.min(durationMinutes, startMinute + cue.minutes);
    cues.push({
      index: cues.length + 1,
      startMinute,
      endMinute,
      label: cue.label,
      prompt: cue.prompt,
    });
    startMinute = endMinute;
  }

  if (startMinute < durationMinutes) {
    cues.push({
      index: cues.length + 1,
      startMinute,
      endMinute: durationMinutes,
      label: "Reflection",
      prompt: "Use this time for learner synthesis and local handoff.",
    });
  }

  return cues;
}

function resolveCueMinutes(minutes: number | null | undefined): number {
  if (minutes === undefined || minutes === null || !Number.isFinite(minutes)) {
    return 0;
  }

  return Math.max(1, Math.floor(minutes));
}

function formatTimingCue(cue: ResolvedTimingCue): string {
  return `${cue.index}. ${cue.startMinute}-${cue.endMinute} min | ${cue.label} | ${cue.prompt}`;
}

function formatBullets(
  values: readonly (string | null | undefined)[] | undefined,
  defaults: readonly string[],
): string[] {
  const normalized = normalizeList(values);
  const bullets = normalized.length > 0 ? normalized : defaults;
  return bullets.map((value) => `- ${formatText(value, "")}`);
}

function formatList(
  values: readonly (string | null | undefined)[] | undefined,
  fallback: string,
): string {
  const normalized = normalizeList(values);
  return normalized.length > 0
    ? normalized.map((value) => formatText(value, "")).join(", ")
    : fallback;
}

function normalizeList(
  values: readonly (string | null | undefined)[] | undefined,
): string[] {
  return (
    values
      ?.map((value) => normalizeText(value))
      .filter((value) => value.length > 0) ?? []
  );
}

function formatText(
  value: string | null | undefined,
  fallback: string,
): string {
  const normalized = normalizeText(value);
  return escapeMarkup(normalized.length > 0 ? normalized : fallback);
}

function normalizeText(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= MAX_TEXT_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_TEXT_LENGTH - 3).trimEnd()}...`;
}

function escapeMarkup(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]");
}
