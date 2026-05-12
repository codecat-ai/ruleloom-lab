import { type AutomatonSettings, clampSettings } from "./automata";
import { DEFAULT_SETTINGS } from "./share";

export interface GalleryExample {
  id: string;
  title: string;
  description: string;
  lookFor: string;
  difficulty: GalleryDifficulty;
  settings: AutomatonSettings;
  comparisonRule?: number;
}

export type GalleryAppliedSettings = AutomatonSettings & {
  comparisonRule: number;
};

export type GalleryDifficulty = "beginner" | "intermediate" | "advanced";

export type GalleryFilterValue<T extends string> = T | "all";

export interface GalleryFilters {
  seedMode?: GalleryFilterValue<AutomatonSettings["seedMode"]>;
  boundaryMode?: GalleryFilterValue<AutomatonSettings["boundaryMode"]>;
  difficulty?: GalleryFilterValue<GalleryDifficulty>;
}

export const GALLERY_EXAMPLES: readonly GalleryExample[] = [
  {
    id: "sierpinski-center",
    title: "Sierpinski lattice",
    description:
      "Rule 90 from a single center cell opens into a clean triangular fractal.",
    lookFor:
      "Watch how every gap repeats at smaller scales as the rows widen downward.",
    difficulty: "beginner",
    settings: {
      rule: 90,
      width: 81,
      generations: 81,
      seedMode: "center",
      boundaryMode: "fixed",
      randomSeed: 1,
      customSeed: "",
    },
  },
  {
    id: "wrapped-traffic-loop",
    title: "Wrapped traffic loop",
    description:
      "Rule 184 with a deterministic random seed turns wrapped edges into a circular traffic lane.",
    lookFor:
      "Cars leaving one edge immediately re-enter from the other, revealing jams and gaps.",
    difficulty: "intermediate",
    settings: {
      rule: 184,
      width: 61,
      generations: 96,
      seedMode: "random",
      boundaryMode: "wrap",
      randomSeed: 184184,
      customSeed: "",
    },
    comparisonRule: 226,
  },
  {
    id: "rule-30-random-field",
    title: "Rule 30 noise field",
    description:
      "Rule 30 starts from a repeatable random row to show deterministic disorder.",
    lookFor:
      "Dense areas keep shedding uneven streaks even though the same seed always returns.",
    difficulty: "intermediate",
    settings: {
      rule: 30,
      width: 95,
      generations: 110,
      seedMode: "random",
      boundaryMode: "fixed",
      randomSeed: 30030,
      customSeed: "",
    },
    comparisonRule: 45,
  },
  {
    id: "custom-seed-glider-lanes",
    title: "Custom seed lanes",
    description:
      "Rule 110 begins from a hand-shaped bit string that launches interacting lanes.",
    lookFor:
      "The seeded cluster splits into angled tracks, then collisions disturb the spacing.",
    difficulty: "advanced",
    settings: {
      rule: 110,
      width: 73,
      generations: 100,
      seedMode: "custom",
      boundaryMode: "fixed",
      randomSeed: 1,
      customSeed:
        "0000000000000000000000000000000011101000100111000000000000000000000000000",
    },
    comparisonRule: 54,
  },
] as const;

export function getGalleryExampleById(id: string): GalleryExample | undefined {
  return GALLERY_EXAMPLES.find((example) => example.id === id);
}

export function filterGalleryExamples(
  filters: GalleryFilters = {},
): GalleryExample[] {
  return GALLERY_EXAMPLES.filter((example) => {
    return (
      matchesFilter(example.settings.seedMode, filters.seedMode) &&
      matchesFilter(example.settings.boundaryMode, filters.boundaryMode) &&
      matchesFilter(example.difficulty, filters.difficulty)
    );
  }).map(copyGalleryExample);
}

export function applyGalleryExample(
  current: GalleryAppliedSettings,
  exampleId: string,
): GalleryAppliedSettings {
  const example = getGalleryExampleById(exampleId);

  if (!example) {
    return current;
  }

  return {
    ...clampSettings({
      ...DEFAULT_SETTINGS,
      ...example.settings,
    }),
    comparisonRule: example.comparisonRule ?? current.comparisonRule,
  };
}

function matchesFilter<T extends string>(
  value: T,
  filter: GalleryFilterValue<T> | undefined,
): boolean {
  return filter === undefined || filter === "all" || value === filter;
}

function copyGalleryExample(example: GalleryExample): GalleryExample {
  return {
    ...example,
    settings: {
      ...example.settings,
    },
  };
}
