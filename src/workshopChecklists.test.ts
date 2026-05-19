import { describe, expect, it } from "vitest";
import {
  formatWorkshopChecklist,
  resolveWorkshopDurationMinutes,
} from "./workshopChecklists";

describe("workshop checklists", () => {
  it("formats a deterministic reusable run sheet from classroom artifacts", () => {
    const checklist = formatWorkshopChecklist({
      title: "Boundary <Jam> [Workshop]",
      durationMinutes: 45.8,
      selectedRules: ["Rule 184", "Rule 226"],
      selectedPresetNames: ["Wrapped traffic loop"],
      lessonPathNames: ["Edges change the story"],
      comparisonFocus: "Compare wrap vs fixed edges & traffic flow.",
      facilitatorNotes: [
        "Keep the board local-first.",
        "Ask: where does the jam re-enter?",
      ],
      timingCues: [
        {
          label: "Launch",
          minutes: 5,
          prompt: "Open with Rule 184.",
        },
        {
          label: "Compare",
          minutes: 18,
          prompt: "Switch boundary modes.",
        },
      ],
      reflectionPrompts: [
        "What changed first?",
        "Which saved set should we reuse?",
      ],
    });

    expect(checklist).toBe(`# Ruleloom Lab workshop run sheet
Title: Boundary &lt;Jam&gt; \\[Workshop\\]
Duration: 45 minutes

## Setup
- Rules: Rule 184, Rule 226
- Presets: Wrapped traffic loop
- Lesson paths: Edges change the story
- Comparison focus: Compare wrap vs fixed edges &amp; traffic flow.

## Facilitator notes
- Keep the board local-first.
- Ask: where does the jam re-enter?

## Timing cues
1. 0-5 min | Launch | Open with Rule 184.
2. 5-23 min | Compare | Switch boundary modes.
3. 23-45 min | Reflection | Use this time for learner synthesis and local handoff.

## Checklist
- Apply or restore the selected comparison set before learners arrive.
- Open the selected lesson path and confirm the current visible rule setup.
- Copy teacher notes or this run sheet for the facilitator.
- Leave time for reflection and local export handoff.

## Reflection prompts
- What changed first?
- Which saved set should we reuse?`);
  });

  it("uses defaults without leaking nullish or blank optional values", () => {
    const checklist = formatWorkshopChecklist({
      title: "",
      selectedRules: ["Rule 90", "", "   "],
      selectedPresetNames: [],
      lessonPathNames: ["Patterns from one spark"],
      comparisonFocus: undefined,
      facilitatorNotes: [null, "  Watch symmetry.  "],
      timingCues: [],
      reflectionPrompts: [],
    });

    expect(checklist).toContain("Title: Untitled workshop");
    expect(checklist).toContain("Duration: 30 minutes");
    expect(checklist).toContain("- Rules: Rule 90");
    expect(checklist).toContain("- Presets: Current visible preset");
    expect(checklist).toContain("- Comparison focus: Compare the active rule");
    expect(checklist).toContain("- Watch symmetry.");
    expect(checklist).toContain(
      "1. 0-30 min | Workshop flow | Facilitate the selected lesson path",
    );
    expect(checklist).toContain("- What pattern evidence should we save?");
    expect(checklist).not.toMatch(/undefined|null/);
  });

  it("bounds duration and timing cue steps sensibly", () => {
    expect(resolveWorkshopDurationMinutes()).toBe(30);
    expect(resolveWorkshopDurationMinutes(0)).toBe(5);
    expect(resolveWorkshopDurationMinutes(999)).toBe(240);

    const checklist = formatWorkshopChecklist({
      title: "Many cues",
      durationMinutes: 12,
      timingCues: Array.from({ length: 8 }, (_, index) => ({
        label: `Cue ${index + 1}`,
        minutes: 1,
        prompt: `Prompt ${index + 1}`,
      })),
    });

    expect(checklist).toContain("Duration: 12 minutes");
    expect(checklist).toContain("6. 5-6 min | Cue 6 | Prompt 6");
    expect(checklist).toContain(
      "7. 6-12 min | Reflection | Use this time for learner synthesis",
    );
    expect(checklist).not.toContain("Cue 7");
    expect(checklist).not.toContain("Cue 8");
  });
});
