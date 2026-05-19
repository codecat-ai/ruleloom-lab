import { describe, expect, it } from "vitest";
import { formatTimingCueSheet, generateTimingCueSchedule } from "./timingCues";
import type { LessonPathStep } from "./lessonPaths";

const steps: LessonPathStep[] = [
  {
    galleryExampleId: "sierpinski-center",
    prompt: "What simple visual rule could explain the repeating gaps?",
  },
  {
    galleryExampleId: "rule-30-random-field",
    prompt: "Which details repeat when the seed stays fixed?",
  },
  {
    galleryExampleId: "custom-seed-glider-lanes",
    prompt: "Where do the moving lanes split or collide?",
  },
];

describe("timing cues", () => {
  it("generates a deterministic 24-minute mini lesson schedule by default", () => {
    expect(
      generateTimingCueSchedule({
        lessonTitle: "Patterns from one spark",
        steps,
      }),
    ).toEqual([
      {
        stepId: "sierpinski-center",
        title: "Step 1",
        suggestedMinutes: 8,
        startMinute: 0,
        endMinute: 8,
        phaseLabel: "Explore",
        facilitatorPrompt:
          "What simple visual rule could explain the repeating gaps?",
      },
      {
        stepId: "rule-30-random-field",
        title: "Step 2",
        suggestedMinutes: 8,
        startMinute: 8,
        endMinute: 16,
        phaseLabel: "Compare",
        facilitatorPrompt: "Which details repeat when the seed stays fixed?",
      },
      {
        stepId: "custom-seed-glider-lanes",
        title: "Step 3",
        suggestedMinutes: 8,
        startMinute: 16,
        endMinute: 24,
        phaseLabel: "Reflect",
        facilitatorPrompt: "Where do the moving lanes split or collide?",
      },
    ]);
  });

  it("uses optional total minutes and keeps every step at least one minute", () => {
    expect(
      generateTimingCueSchedule({
        lessonTitle: "Short contrast",
        totalMinutes: 5,
        steps,
      }).map((cue) => cue.suggestedMinutes),
    ).toEqual([2, 2, 1]);
  });

  it("returns an empty schedule for an empty lesson path", () => {
    expect(
      generateTimingCueSchedule({
        lessonTitle: "Empty",
        steps: [],
      }),
    ).toEqual([]);
  });

  it("keeps long local metadata prompts as normalized plain strings", () => {
    const longPrompt = `  ${"Observe the lane. ".repeat(20)}
    Ask what repeats next.  `;

    const [cue] = generateTimingCueSchedule({
      lessonTitle: "Long prompt path",
      steps: [{ prompt: longPrompt }],
    });

    expect(cue.facilitatorPrompt).toBe(
      `${"Observe the lane. ".repeat(20)}Ask what repeats next.`,
    );
  });

  it("rejects non-finite and unreasonable total minute values", () => {
    expect(() =>
      generateTimingCueSchedule({
        lessonTitle: "Invalid",
        totalMinutes: Number.POSITIVE_INFINITY,
        steps,
      }),
    ).toThrow("totalMinutes must be a finite number from 1 to 180.");

    expect(() =>
      generateTimingCueSchedule({
        lessonTitle: "Invalid",
        totalMinutes: 181,
        steps,
      }),
    ).toThrow("totalMinutes must be a finite number from 1 to 180.");
  });

  it("formats a deterministic plain-text facilitator cue sheet", () => {
    const schedule = generateTimingCueSchedule({
      lessonTitle: "Patterns from one spark",
      steps,
    });

    expect(
      formatTimingCueSheet({
        lessonTitle: "Patterns from one spark",
        totalMinutes: 24,
        schedule,
      }),
    ).toBe(`Ruleloom Lab timing cues
Lesson: Patterns from one spark
Total: 24 minutes

1. 0-8 min | Explore | Step 1
Prompt: What simple visual rule could explain the repeating gaps?

2. 8-16 min | Compare | Step 2
Prompt: Which details repeat when the seed stays fixed?

3. 16-24 min | Reflect | Step 3
Prompt: Where do the moving lanes split or collide?`);
  });
});
