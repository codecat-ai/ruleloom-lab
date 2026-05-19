import {
  applyGalleryExample,
  GALLERY_EXAMPLES,
  type GalleryAppliedSettings,
  type GalleryExample,
} from "./gallery";
import type { AutomatonSettings } from "./automata";
import { DEFAULT_SETTINGS } from "./share";

export interface LessonPath {
  id: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  audience: string;
  steps: LessonPathStep[];
}

export interface LessonPathStep {
  galleryExampleId?: string;
  prompt: string;
  settings?: AutomatonSettings;
  comparisonRule?: number;
}

export interface ResolvedLessonPathStep extends LessonPathStep {
  pathId: string;
  stepIndex: number;
  example: GalleryExample;
}

export const LESSON_PATHS: readonly LessonPath[] = [
  {
    id: "patterns-from-one-spark",
    title: "Patterns from one spark",
    summary:
      "Start with a single clean spark, then compare deterministic noise and hand-built Rule 110 lanes.",
    estimatedMinutes: 12,
    audience: "Beginner to advanced",
    steps: [
      {
        galleryExampleId: "sierpinski-center",
        prompt:
          "What simple visual rule could explain the repeating triangular gaps?",
      },
      {
        galleryExampleId: "rule-30-random-field",
        prompt:
          "Which streaks look random, and which details repeat when the seed stays fixed?",
      },
      {
        galleryExampleId: "custom-seed-glider-lanes",
        prompt:
          "Where do the moving lanes split, collide, or keep their spacing?",
      },
    ],
  },
  {
    id: "edges-change-the-story",
    title: "Edges change the story",
    summary:
      "Compare a fixed-edge start with wrapped motion to see how boundaries change the story.",
    estimatedMinutes: 10,
    audience: "Facilitated comparison",
    steps: [
      {
        galleryExampleId: "sierpinski-center",
        prompt:
          "How do the fixed zero edges frame the triangle as it grows outward?",
      },
      {
        galleryExampleId: "wrapped-traffic-loop",
        prompt:
          "What changes when cells leaving one side immediately return on the other?",
      },
      {
        galleryExampleId: "wrapped-traffic-loop",
        prompt:
          "Where would you pause the traffic loop to discuss jams, gaps, and flow?",
      },
    ],
  },
] as const;

export function listLessonPaths(): LessonPath[] {
  return LESSON_PATHS.map(copyLessonPath);
}

export function getLessonPath(id: string): LessonPath | null {
  const path = LESSON_PATHS.find((lessonPath) => lessonPath.id === id);
  return path ? copyLessonPath(path) : null;
}

export function getLessonPathStep(
  pathId: string,
  index: number,
): ResolvedLessonPathStep | null {
  if (!Number.isInteger(index) || index < 0) {
    return null;
  }

  const path = LESSON_PATHS.find((lessonPath) => lessonPath.id === pathId);
  const step = path?.steps[index];

  if (!path || !step) {
    return null;
  }

  const example = GALLERY_EXAMPLES.find(
    (galleryExample) => galleryExample.id === step.galleryExampleId,
  );

  if (!example || !step.galleryExampleId) {
    return null;
  }

  return {
    ...step,
    pathId: path.id,
    stepIndex: index,
    example: copyGalleryExample(example),
  };
}

export function applyLessonPathStep(
  pathId: string,
  index: number,
): GalleryAppliedSettings | null {
  return applyLessonPathStepFromPaths(LESSON_PATHS, pathId, index);
}

export function applyLessonPathStepFromPaths(
  paths: readonly LessonPath[],
  pathId: string,
  index: number,
): GalleryAppliedSettings | null {
  if (!Number.isInteger(index) || index < 0) {
    return null;
  }

  const path = paths.find((lessonPath) => lessonPath.id === pathId);
  const step = path?.steps[index];

  if (!path || !step) {
    return null;
  }

  if (step.settings) {
    return {
      ...step.settings,
      comparisonRule: step.comparisonRule ?? step.settings.rule,
    };
  }

  return step.galleryExampleId
    ? applyGalleryExample(
        {
          ...DEFAULT_SETTINGS,
          comparisonRule: step.comparisonRule ?? 90,
        },
        step.galleryExampleId,
      )
    : null;
}

function copyLessonPath(path: LessonPath): LessonPath {
  return {
    ...path,
    steps: path.steps.map((step) => ({
      ...step,
      settings: step.settings ? { ...step.settings } : undefined,
    })),
  };
}

function copyGalleryExample(example: GalleryExample): GalleryExample {
  return {
    ...example,
    settings: {
      ...example.settings,
    },
  };
}
