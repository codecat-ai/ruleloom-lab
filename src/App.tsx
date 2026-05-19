import {
  type AutomatonSettings,
  decodeRule,
  generateAutomaton,
  neighborhoods,
  MAX_GENERATIONS,
  MAX_WIDTH,
  MIN_GENERATIONS,
  MIN_WIDTH,
  clamp,
} from "./automata";
import {
  DEFAULT_SETTINGS,
  parseSettingsQuery,
  serializeSettingsQuery,
} from "./share";
import {
  applyGalleryExample,
  filterGalleryExamples,
  GALLERY_EXAMPLES,
  type GalleryAppliedSettings,
  type GalleryDifficulty,
  type GalleryFilters,
} from "./gallery";
import {
  applyLessonPathStepFromPaths,
  listLessonPaths,
  type LessonPath,
} from "./lessonPaths";
import { exportLessonPathPack, importLessonPathPack } from "./lessonPathPacks";
import {
  addGenerationAnnotation,
  parseGenerationAnnotationsJson,
  removeGenerationAnnotation,
  serializeGenerationAnnotations,
  sortGenerationAnnotations,
  type GenerationAnnotation,
} from "./generationAnnotations";
import {
  createComparisonSetFromSettings,
  exportComparisonSetsJson,
  importComparisonSetsJson,
  listComparisonSets,
  removeComparisonSet,
  saveComparisonSet,
  savedComparisonSetToSettings,
  type ComparisonSetCreateOptions,
  type ComparisonSetStorage,
  type SavedComparisonSet,
} from "./comparisonSets";
import { compareRules, type RuleComparisonSeed } from "./ruleComparison";
import { exportPatternRle } from "./rleExport";
import { parseRuleloomRle } from "./rleImport";
import { exportPatternSvg } from "./svgExport";
import { exportPatternText } from "./textExport";
import {
  exportPatternPngDataUrl,
  type PngCanvasFactory,
  type PngExportPayload,
} from "./pngExport";
import {
  formatTeacherNotesHtml,
  printTeacherNotes,
  type TeacherNotesContext,
  type TeacherNotesPrintOptions,
} from "./teacherNotes";
import {
  formatSessionSummary,
  type SessionSummaryContext,
} from "./sessionSummaries";
import { formatWorkshopChecklist } from "./workshopChecklists";
import {
  applyPacingPresetToLessonPath,
  formatPacingGuide,
  getPacingPreset,
  listPacingPresets,
  type PacedLessonPathStep,
} from "./pacingPresets";
import {
  resolveProjectorModeButtonLabel,
  resolveProjectorModeRootClassName,
  resolveProjectorModeStatusText,
} from "./projectorMode";
import "./App.css";

const PRESETS = [
  {
    label: "Rule 30",
    rule: 30,
    explanation:
      "Chaotic, pseudo-random growth from a simple deterministic rule.",
  },
  {
    label: "Rule 90",
    rule: 90,
    explanation:
      "Creates nested Sierpinski triangles that reveal self-similarity.",
  },
  {
    label: "Rule 110",
    rule: 110,
    explanation:
      "Computationally universal behavior with persistent moving structures.",
  },
  {
    label: "Rule 184",
    rule: 184,
    explanation: "Models traffic flow as particles moving through local gaps.",
  },
] as const;

export type KeyboardShortcutAction =
  | { type: "toggleRun" }
  | { type: "step" }
  | { type: "reset" }
  | { type: "preset"; rule: number };

interface KeyboardShortcutInput {
  key: string;
  targetTagName?: string;
  targetIsContentEditable?: boolean;
}

interface AppSettings extends AutomatonSettings {
  comparisonRule: number;
}

const DEFAULT_TEACHER_NOTE_PROMPTS = [
  "Which neighborhoods produce live cells, and how do those choices shape growth?",
  "Where do the compared rules first diverge under the same seed and boundary mode?",
  "How does changing the boundary mode affect evidence at the edges?",
] as const;

export function getPresetExplanations(): Array<(typeof PRESETS)[number]> {
  return [...PRESETS];
}

export function getGalleryExamples(): Array<(typeof GALLERY_EXAMPLES)[number]> {
  return filterGalleryExamples();
}

export function getLessonPaths(): LessonPath[] {
  return listLessonPaths();
}

export function resolveKeyboardShortcut(
  input: KeyboardShortcutInput,
): KeyboardShortcutAction | undefined {
  if (isFormControlTarget(input)) {
    return undefined;
  }

  if (input.key === " ") {
    return { type: "toggleRun" };
  }

  if (input.key === "ArrowRight" || input.key === ".") {
    return { type: "step" };
  }

  if (input.key.toLowerCase() === "r") {
    return { type: "reset" };
  }

  const presetIndex = Number(input.key) - 1;
  const preset = PRESETS[presetIndex];
  return preset ? { type: "preset", rule: preset.rule } : undefined;
}

export function createAppHtml(
  settings: AutomatonSettings | AppSettings = DEFAULT_SETTINGS,
  exportStatus = "",
  rleImportText = "",
  galleryFilters: GalleryFilters = {},
  projectorMode = false,
  localLessonPaths: LessonPath[] = [],
  lessonPathPackImportText = "",
  lessonPathPackStatus = "",
  generationAnnotations: GenerationAnnotation[] = [],
  generationAnnotationLabel = "",
  generationAnnotationNote = "",
  generationAnnotationsImportText = "",
  generationAnnotationStatus = "",
  comparisonSets: SavedComparisonSet[] = [],
  comparisonSetTitle = "",
  comparisonSetNote = "",
  comparisonSetsImportText = "",
  comparisonSetStatus = "",
  sessionSummaryStatus = "",
  workshopChecklistStatus = "",
  selectedPacingPresetId = "standard",
): string {
  const appSettings = normalizeAppSettings(settings);
  const normalizedGalleryFilters = normalizeGalleryFilters(galleryFilters);
  const galleryExamples = filterGalleryExamples(normalizedGalleryFilters);
  const lessonPaths = [
    ...listLessonPaths(),
    ...copyLessonPaths(localLessonPaths),
  ];
  const pacingPreset =
    getPacingPreset(selectedPacingPresetId) ?? getPacingPreset("standard");
  const rows = generateAutomaton(appSettings);
  const ruleTable = decodeRule(appSettings.rule);
  const boundaryLabel = boundaryModeLabel(appSettings.boundaryMode);
  const projectorModeButtonLabel =
    resolveProjectorModeButtonLabel(projectorMode);
  const projectorModeStatusText = resolveProjectorModeStatusText(
    projectorMode,
    {
      rule: appSettings.rule,
      width: appSettings.width,
      generations: appSettings.generations,
      boundaryModeLabel: boundaryLabel,
    },
  );
  const comparison = compareRules({
    primaryRule: appSettings.rule,
    comparisonRule: appSettings.comparisonRule,
    width: appSettings.width,
    steps: appSettings.generations,
    seed: comparisonSeedFromSettings(appSettings),
    wrap: appSettings.boundaryMode === "wrap",
  });
  const sortedGenerationAnnotations = sortGenerationAnnotations(
    generationAnnotations,
  );

  return `
    <main class="${resolveProjectorModeRootClassName(projectorMode)}">
      <section class="intro">
        <div>
          <p class="eyebrow">Elementary cellular automata</p>
          <h1>Ruleloom Lab</h1>
          <p class="lede">Explore how three-cell neighborhood rules weave complex local-first patterns.</p>
        </div>
        <div class="presentation-tools">
          <div class="status" aria-live="polite">
            <span>Rule ${appSettings.rule}</span>
            <span>${appSettings.width} cells</span>
            <span>${appSettings.generations} rows</span>
            <span>${boundaryLabel}</span>
          </div>
          <button type="button" class="projector-toggle" data-action="toggle-projector-mode" aria-pressed="${projectorMode}">${projectorModeButtonLabel}</button>
          <p class="projector-status" role="status" aria-live="polite">${projectorModeStatusText}</p>
        </div>
      </section>

      <section class="controls" aria-label="Simulation controls">
        <label>
          Rule
          <input id="rule" type="number" min="0" max="255" value="${appSettings.rule}" />
        </label>
        <label>
          Compare with rule
          <input id="comparisonRule" type="number" min="0" max="255" value="${appSettings.comparisonRule}" />
        </label>
        <label>
          Width
          <input id="width" type="number" min="${MIN_WIDTH}" max="${MAX_WIDTH}" value="${appSettings.width}" />
        </label>
        <label>
          Generations
          <input id="generations" type="number" min="${MIN_GENERATIONS}" max="${MAX_GENERATIONS}" value="${appSettings.generations}" />
        </label>
        <label>
          Seed
          <select id="seedMode">
            ${selectOption("center", "Center", appSettings.seedMode)}
            ${selectOption("random", "Deterministic random", appSettings.seedMode)}
            ${selectOption("custom", "Custom bits", appSettings.seedMode)}
          </select>
        </label>
        <label>
          Boundary
          <select id="boundaryMode">
            ${selectOption("fixed", "Fixed zero edges", appSettings.boundaryMode ?? "fixed")}
            ${selectOption("wrap", "Wrapped circular edges", appSettings.boundaryMode ?? "fixed")}
          </select>
        </label>
        <label>
          Random seed
          <input id="randomSeed" type="number" value="${appSettings.randomSeed ?? 1}" />
        </label>
        <label class="wide">
          Custom bits
          <input id="customSeed" type="text" inputmode="numeric" value="${escapeHtml(appSettings.customSeed ?? "")}" />
        </label>
      </section>

      <section class="rle-import" aria-label="RLE import">
        <label>
          Paste Ruleloom RLE
          <textarea id="rleImport" rows="5" spellcheck="false">${escapeHtml(rleImportText)}</textarea>
        </label>
        <button type="button" data-action="import-rle">Import RLE</button>
      </section>

      <section class="comparison-summary" aria-live="polite" aria-label="Rule comparison summary">
        <strong>Rule ${appSettings.rule} vs Rule ${appSettings.comparisonRule}</strong>
        <span>First differing generation: ${formatFirstDifference(comparison.firstDifferingGeneration)}</span>
        <span>Total differing cells: ${comparison.totalDifferingCells} ${comparison.totalDifferingCells === 1 ? "cell differs" : "cells differ"}</span>
      </section>

      <section class="comparison-sets" aria-label="Saved comparison sets">
        <div class="section-heading">
          <h2>Saved comparison sets</h2>
          <p>Save local comparison setups for recurring workshops. Sets stay in this browser unless you copy the JSON.</p>
        </div>
        <div class="comparison-set-composer">
          <label>
            Title
            <input id="comparisonSetTitle" data-comparison-set-field="title" type="text" maxlength="80" value="${escapeHtml(comparisonSetTitle)}" />
          </label>
          <label>
            Note
            <textarea id="comparisonSetNote" data-comparison-set-field="note" rows="3">${escapeHtml(comparisonSetNote)}</textarea>
          </label>
          <button type="button" data-action="save-comparison-set">Save comparison set</button>
        </div>
        <div class="comparison-set-tools">
          <button type="button" data-action="copy-comparison-sets">Copy sets JSON</button>
          <label>
            Paste sets JSON
            <textarea id="comparisonSetsImport" rows="4" spellcheck="false">${escapeHtml(comparisonSetsImportText)}</textarea>
          </label>
          <button type="button" data-action="import-comparison-sets">Import sets JSON</button>
          <p class="comparison-set-status" role="status" aria-live="polite">${escapeHtml(comparisonSetStatus)}</p>
        </div>
        <div class="comparison-set-list">
          ${
            comparisonSets.length > 0
              ? renderComparisonSets(comparisonSets)
              : `<p class="comparison-set-empty" role="status">No saved comparison sets yet.</p>`
          }
        </div>
      </section>

      <section class="actions" aria-label="Run controls">
        ${PRESETS.map((preset) => `<button type="button" data-preset="${preset.rule}" aria-label="${preset.label} preset">${preset.label}</button>`).join("")}
        <button type="button" data-action="step">Step</button>
        <button type="button" data-action="reset">Reset</button>
        <button type="button" data-action="run">Run</button>
        <button type="button" data-action="share">Copy share URL</button>
        <button type="button" data-action="copy-text">Copy text</button>
        <button type="button" data-action="copy-svg">Copy SVG</button>
        <button type="button" data-action="copy-rle">Copy RLE</button>
        <button type="button" data-action="copy-session-summary">Copy session summary</button>
        <button type="button" data-action="copy-workshop-checklist">Copy workshop checklist</button>
        <button type="button" data-action="download-png">Download PNG</button>
        <button type="button" data-action="print-teacher-notes">Print teacher notes</button>
        <p class="export-status" aria-live="polite" aria-label="Export status">${escapeHtml(exportStatus)}</p>
        <p class="session-summary-status" role="status" aria-live="polite" aria-label="Session summary status">${escapeHtml(sessionSummaryStatus)}</p>
        <p class="workshop-checklist-status" role="status" aria-live="polite" aria-label="Workshop checklist status">${escapeHtml(workshopChecklistStatus)}</p>
        <p class="shortcut-copy"><strong>Keyboard shortcuts</strong> Space: Run/Pause · ArrowRight or .: Step · R: Reset · 1-4: Presets</p>
      </section>

      <section class="generation-annotations" aria-label="Generation annotations">
        <div class="section-heading">
          <h2>Generation annotations</h2>
          <p>Mark notable generations during facilitation. Annotations stay in this browser session unless you copy the JSON.</p>
        </div>
        <div class="generation-annotation-composer">
          <p class="current-generation">Current visible generation: ${appSettings.generations}</p>
          <label>
            Label
            <input id="annotationLabel" data-generation-annotation-field="label" type="text" maxlength="80" value="${escapeHtml(generationAnnotationLabel)}" />
          </label>
          <label>
            Note
            <textarea id="annotationNote" data-generation-annotation-field="note" rows="3">${escapeHtml(generationAnnotationNote)}</textarea>
          </label>
          <button type="button" data-action="add-generation-annotation">Add annotation</button>
        </div>
        <div class="generation-annotation-tools">
          <button type="button" data-action="copy-generation-annotations">Copy annotations JSON</button>
          <label>
            Paste annotations JSON
            <textarea id="generationAnnotationsImport" rows="4" spellcheck="false">${escapeHtml(generationAnnotationsImportText)}</textarea>
          </label>
          <button type="button" data-action="import-generation-annotations">Import annotations JSON</button>
          <p class="generation-annotation-status" role="status" aria-live="polite">${escapeHtml(generationAnnotationStatus)}</p>
        </div>
        <div class="generation-annotation-list">
          ${
            sortedGenerationAnnotations.length > 0
              ? renderGenerationAnnotationGroups(sortedGenerationAnnotations)
              : `<p class="generation-annotation-empty" role="status">No generation annotations yet.</p>`
          }
        </div>
      </section>

      <section class="preset-explanations" aria-label="Preset explanations">
        ${PRESETS.map((preset) => `<article data-preset-explanation="${preset.rule}"><strong>${preset.label}</strong><span>${preset.explanation}</span></article>`).join("")}
      </section>

      <section class="lesson-paths" aria-label="Lesson paths">
        <div class="section-heading">
          <h2>Lesson paths</h2>
          <p>Run a short guided sequence of gallery examples or imported local packs with prompts for learners and facilitators.</p>
        </div>
        <div class="lesson-pacing-control">
          <label for="lessonPacingPreset">
            Pacing preset
            <select id="lessonPacingPreset" data-pacing-preset>
              ${listPacingPresets()
                .map((preset) =>
                  selectOption(
                    preset.id,
                    preset.label,
                    pacingPreset?.id ?? "standard",
                  ),
                )
                .join("")}
            </select>
          </label>
          <p>${escapeHtml(pacingPreset ? `${pacingPreset.label}: ${pacingPreset.totalMinutes} minutes · ${pacingPreset.audience}` : "")}</p>
        </div>
        <div class="lesson-path-pack-tools">
          <button type="button" data-action="copy-lesson-path-pack">Copy built-in lesson paths</button>
          <label>
            Paste lesson path pack JSON
            <textarea id="lessonPathPackImport" rows="5" spellcheck="false">${escapeHtml(lessonPathPackImportText)}</textarea>
          </label>
          <button type="button" data-action="import-lesson-path-pack">Import lesson path pack</button>
          <p class="lesson-path-pack-status" role="status" aria-live="polite">${escapeHtml(lessonPathPackStatus)}</p>
        </div>
        <div class="lesson-path-grid">
          ${lessonPaths.map((path) => renderLessonPath(path, pacingPreset?.id ?? "standard")).join("")}
        </div>
      </section>

      <section class="gallery-examples" aria-label="Gallery examples">
        <div class="section-heading">
          <h2>Gallery examples</h2>
          <p>Apply a curated setup, then share or export it with the same local controls.</p>
        </div>
        <div class="gallery-filters" aria-label="Gallery filters">
          <label for="gallerySeedMode">
            Seed filter
            <select id="gallerySeedMode" data-gallery-filter="seedMode">
              ${selectOption("all", "All seeds", normalizedGalleryFilters.seedMode)}
              ${selectOption("center", "Center", normalizedGalleryFilters.seedMode)}
              ${selectOption("random", "Random", normalizedGalleryFilters.seedMode)}
              ${selectOption("custom", "Custom", normalizedGalleryFilters.seedMode)}
            </select>
          </label>
          <label for="galleryBoundaryMode">
            Boundary filter
            <select id="galleryBoundaryMode" data-gallery-filter="boundaryMode">
              ${selectOption("all", "All boundaries", normalizedGalleryFilters.boundaryMode)}
              ${selectOption("fixed", "Fixed", normalizedGalleryFilters.boundaryMode)}
              ${selectOption("wrap", "Wrapped", normalizedGalleryFilters.boundaryMode)}
            </select>
          </label>
          <label for="galleryDifficulty">
            Difficulty
            <select id="galleryDifficulty" data-gallery-filter="difficulty">
              ${selectOption("all", "All levels", normalizedGalleryFilters.difficulty)}
              ${selectOption("beginner", "Beginner", normalizedGalleryFilters.difficulty)}
              ${selectOption("intermediate", "Intermediate", normalizedGalleryFilters.difficulty)}
              ${selectOption("advanced", "Advanced", normalizedGalleryFilters.difficulty)}
            </select>
          </label>
        </div>
        <div class="gallery-grid">
          ${
            galleryExamples.length > 0
              ? galleryExamples
                  .map(
                    (example) => `<article data-gallery-example="${example.id}">
              <div>
                <strong>${escapeHtml(example.title)}</strong>
                <small>${galleryDifficultyLabel(example.difficulty)}</small>
                <p>${escapeHtml(example.description)}</p>
                <span>${escapeHtml(example.lookFor)}</span>
              </div>
              <button type="button" data-gallery-apply="${example.id}">Apply</button>
            </article>`,
                  )
                  .join("")
              : `<p class="gallery-empty" role="status">No gallery examples match these filters yet.</p>`
          }
        </div>
      </section>

      <section class="layout">
        <table class="rule-table" aria-label="Rule table">
          <thead>
            <tr>${neighborhoods()
              .map((neighborhood) => `<th><code>${neighborhood}</code></th>`)
              .join("")}</tr>
          </thead>
          <tbody>
            <tr>${neighborhoods()
              .map((neighborhood) => `<td>${ruleTable[neighborhood]}</td>`)
              .join("")}</tr>
          </tbody>
        </table>

        <div class="grid-wrap">
          <div class="automaton-grid" role="grid" aria-label="Automaton grid" style="--cells: ${appSettings.width}">
            ${rows.map((row, rowIndex) => row.map((bit, columnIndex) => `<span role="gridcell" class="cell ${bit ? "alive" : ""}" aria-label="row ${rowIndex + 1}, cell ${columnIndex + 1}, ${bit ? "alive" : "empty"}"></span>`).join("")).join("")}
          </div>
        </div>
      </section>
    </main>
  `;
}

export function mountApp(root: HTMLElement): void {
  let settings: AppSettings = normalizeAppSettings(
    parseSettingsQuery(globalThis.location?.search ?? ""),
  );
  let visibleGenerations = settings.generations;
  let exportStatus = "";
  let rleImportText = "";
  let lessonPathPackImportText = "";
  let localLessonPaths: LessonPath[] = [];
  let lessonPathPackStatus = "";
  let generationAnnotations: GenerationAnnotation[] = [];
  let generationAnnotationLabel = "";
  let generationAnnotationNote = "";
  let generationAnnotationsImportText = "";
  let generationAnnotationStatus = "";
  let comparisonSets = readComparisonSetsFromBrowserStorage();
  let comparisonSetTitle = "";
  let comparisonSetNote = "";
  let comparisonSetsImportText = "";
  let comparisonSetStatus = "";
  let sessionSummaryStatus = "";
  let workshopChecklistStatus = "";
  let galleryFilters = normalizeGalleryFilters();
  let teacherNotesContext: TeacherNotesContext | undefined;
  let teacherNotesPrompts = [...DEFAULT_TEACHER_NOTE_PROMPTS];
  let projectorMode = false;
  let selectedPacingPresetId = "standard";
  let timer: number | undefined;

  const render = () => {
    root.innerHTML = createAppHtml(
      { ...settings, generations: visibleGenerations },
      exportStatus,
      rleImportText,
      galleryFilters,
      projectorMode,
      localLessonPaths,
      lessonPathPackImportText,
      lessonPathPackStatus,
      generationAnnotations,
      generationAnnotationLabel,
      generationAnnotationNote,
      generationAnnotationsImportText,
      generationAnnotationStatus,
      comparisonSets,
      comparisonSetTitle,
      comparisonSetNote,
      comparisonSetsImportText,
      comparisonSetStatus,
      sessionSummaryStatus,
      workshopChecklistStatus,
      selectedPacingPresetId,
    );
    bindEvents();
  };

  const updateFromControls = () => {
    settings = normalizeAppSettings(
      parseSettingsQuery(serializeSettingsQuery(readSettings(root, settings))),
      {
        comparisonRule: readNumber(
          root,
          "#comparisonRule",
          settings.comparisonRule,
        ),
      },
    );
    visibleGenerations = settings.generations;
    history.replaceState(null, "", serializeSettingsQuery(settings));
    render();
  };

  const applyPreset = (rule: number) => {
    settings = { ...settings, rule };
    const preset = PRESETS.find((candidate) => candidate.rule === rule);
    teacherNotesContext = preset
      ? {
          source: "preset",
          title: preset.label,
          description: preset.explanation,
        }
      : undefined;
    teacherNotesPrompts = [...DEFAULT_TEACHER_NOTE_PROMPTS];
    history.replaceState(null, "", serializeSettingsQuery(settings));
    render();
  };

  const applyGallery = (exampleId: string) => {
    stop();
    const applied = resolveGalleryApply(
      settings,
      visibleGenerations,
      exampleId,
    );
    settings = applied.settings;
    visibleGenerations = applied.visibleGenerations;
    const example = GALLERY_EXAMPLES.find(
      (candidate) => candidate.id === exampleId,
    );
    teacherNotesContext = example
      ? {
          source: "gallery",
          title: example.title,
          description: `${example.description} ${example.lookFor}`,
        }
      : undefined;
    teacherNotesPrompts = [...DEFAULT_TEACHER_NOTE_PROMPTS];
    history.replaceState(null, "", applied.shareQuery);
    render();
  };

  const applyLessonPath = (pathId: string, stepIndex: number) => {
    stop();
    const allLessonPaths = [...listLessonPaths(), ...localLessonPaths];
    const applied = resolveLessonPathApply(
      settings,
      visibleGenerations,
      pathId,
      stepIndex,
      allLessonPaths,
    );

    if (!applied) {
      return;
    }

    settings = applied.settings;
    visibleGenerations = applied.visibleGenerations;
    const path = allLessonPaths.find((candidate) => candidate.id === pathId);
    const step = path?.steps[stepIndex];
    teacherNotesContext =
      path && step
        ? {
            source: "lesson",
            title: path.title,
            description: `${path.summary} Current prompt: ${step.prompt}`,
          }
        : undefined;
    teacherNotesPrompts = path
      ? path.steps.map((lessonStep) => lessonStep.prompt)
      : [...DEFAULT_TEACHER_NOTE_PROMPTS];
    history.replaceState(null, "", applied.shareQuery);
    render();
  };

  const step = () => {
    visibleGenerations = Math.min(MAX_GENERATIONS, visibleGenerations + 1);
    render();
  };

  const reset = () => {
    stop();
    visibleGenerations = 1;
    render();
  };

  const toggleRun = () => {
    if (timer !== undefined) {
      stop();
      return;
    }

    timer = globalThis.setInterval(() => {
      visibleGenerations =
        visibleGenerations >= settings.generations ? 1 : visibleGenerations + 1;
      render();
    }, 180);
  };

  const handleKeydown = (event: KeyboardEvent) => {
    const shortcut = resolveKeyboardShortcut({
      key: event.key,
      targetTagName: readTargetTagName(event.target),
      targetIsContentEditable: readTargetIsContentEditable(event.target),
    });

    if (!shortcut) {
      return;
    }

    event.preventDefault();

    if (shortcut.type === "toggleRun") {
      toggleRun();
    } else if (shortcut.type === "step") {
      step();
    } else if (shortcut.type === "reset") {
      reset();
    } else {
      applyPreset(shortcut.rule);
    }
  };

  const bindEvents = () => {
    root
      .querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select")
      .forEach((control) => {
        if (control.hasAttribute("data-gallery-filter")) {
          return;
        }
        if (control.hasAttribute("data-pacing-preset")) {
          return;
        }
        if (control.hasAttribute("data-generation-annotation-field")) {
          return;
        }
        if (control.hasAttribute("data-comparison-set-field")) {
          return;
        }
        control.addEventListener("change", updateFromControls);
      });

    root
      .querySelector<HTMLSelectElement>("[data-pacing-preset]")
      ?.addEventListener("change", (event) => {
        selectedPacingPresetId = event.currentTarget.value;
        render();
      });

    root
      .querySelectorAll<HTMLSelectElement>("[data-gallery-filter]")
      .forEach((control) => {
        control.addEventListener("change", () => {
          galleryFilters = readGalleryFilters(root);
          render();
        });
      });

    root
      .querySelectorAll<HTMLButtonElement>("[data-preset]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          applyPreset(Number(button.dataset.preset));
        });
      });

    root
      .querySelectorAll<HTMLButtonElement>("[data-gallery-apply]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          applyGallery(button.dataset.galleryApply ?? "");
        });
      });

    root
      .querySelectorAll<HTMLButtonElement>("[data-lesson-path-apply]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          applyLessonPath(
            button.dataset.lessonPathApply ?? "",
            Number(button.dataset.lessonStep),
          );
        });
      });

    root
      .querySelector<HTMLButtonElement>("[data-action='step']")
      ?.addEventListener("click", step);

    root
      .querySelector<HTMLButtonElement>("[data-action='reset']")
      ?.addEventListener("click", reset);

    root
      .querySelector<HTMLButtonElement>("[data-action='run']")
      ?.addEventListener("click", toggleRun);

    root
      .querySelector<HTMLButtonElement>("[data-action='toggle-projector-mode']")
      ?.addEventListener("click", () => {
        projectorMode = !projectorMode;
        render();
      });

    root
      .querySelector<HTMLButtonElement>("[data-action='share']")
      ?.addEventListener("click", async () => {
        const url = `${location.origin}${location.pathname}${serializeSettingsQuery(settings)}`;
        await navigator.clipboard?.writeText(url);
      });

    root
      .querySelector<HTMLButtonElement>("[data-action='copy-svg']")
      ?.addEventListener("click", async () => {
        await copySvgForSettings(settings, visibleGenerations, (svg) => {
          return navigator.clipboard?.writeText(svg) ?? Promise.resolve();
        });
      });

    root
      .querySelector<HTMLButtonElement>("[data-action='copy-text']")
      ?.addEventListener("click", async () => {
        await copyTextForSettings(settings, visibleGenerations, (text) => {
          return navigator.clipboard?.writeText(text) ?? Promise.resolve();
        });
      });

    root
      .querySelector<HTMLButtonElement>("[data-action='copy-rle']")
      ?.addEventListener("click", async () => {
        await copyRleForSettings(settings, visibleGenerations, (rle) => {
          return navigator.clipboard?.writeText(rle) ?? Promise.resolve();
        });
      });

    root
      .querySelector<HTMLButtonElement>("[data-action='copy-session-summary']")
      ?.addEventListener("click", async () => {
        try {
          await copySessionSummaryForState(
            settings,
            visibleGenerations,
            generationAnnotations,
            teacherNotesContext,
            teacherNotesPrompts,
            copyTextFromBrowser,
          );
          sessionSummaryStatus = "Copied session summary.";
        } catch (error) {
          sessionSummaryStatus =
            error instanceof Error
              ? `Session summary copy failed: ${error.message}`
              : "Session summary copy failed.";
        }
        render();
      });

    root
      .querySelector<HTMLButtonElement>(
        "[data-action='copy-workshop-checklist']",
      )
      ?.addEventListener("click", async () => {
        try {
          await copyWorkshopChecklistForState(
            settings,
            visibleGenerations,
            teacherNotesContext,
            teacherNotesPrompts,
            copyTextFromBrowser,
            selectedPacingPresetId,
          );
          workshopChecklistStatus = "Copied workshop checklist.";
        } catch (error) {
          workshopChecklistStatus =
            error instanceof Error
              ? `Workshop checklist copy failed: ${error.message}`
              : "Workshop checklist copy failed.";
        }
        render();
      });

    root
      .querySelector<HTMLTextAreaElement>("#rleImport")
      ?.addEventListener("input", (event) => {
        rleImportText = event.currentTarget.value;
      });

    root
      .querySelector<HTMLTextAreaElement>("#lessonPathPackImport")
      ?.addEventListener("input", (event) => {
        lessonPathPackImportText = event.currentTarget.value;
      });

    root
      .querySelector<HTMLInputElement>("#annotationLabel")
      ?.addEventListener("input", (event) => {
        generationAnnotationLabel = event.currentTarget.value;
      });

    root
      .querySelector<HTMLTextAreaElement>("#annotationNote")
      ?.addEventListener("input", (event) => {
        generationAnnotationNote = event.currentTarget.value;
      });

    root
      .querySelector<HTMLTextAreaElement>("#generationAnnotationsImport")
      ?.addEventListener("input", (event) => {
        generationAnnotationsImportText = event.currentTarget.value;
      });

    root
      .querySelector<HTMLInputElement>("#comparisonSetTitle")
      ?.addEventListener("input", (event) => {
        comparisonSetTitle = event.currentTarget.value;
      });

    root
      .querySelector<HTMLTextAreaElement>("#comparisonSetNote")
      ?.addEventListener("input", (event) => {
        comparisonSetNote = event.currentTarget.value;
      });

    root
      .querySelector<HTMLTextAreaElement>("#comparisonSetsImport")
      ?.addEventListener("input", (event) => {
        comparisonSetsImportText = event.currentTarget.value;
      });

    root
      .querySelector<HTMLButtonElement>("[data-action='save-comparison-set']")
      ?.addEventListener("click", () => {
        comparisonSetTitle =
          root.querySelector<HTMLInputElement>("#comparisonSetTitle")?.value ??
          "";
        comparisonSetNote =
          root.querySelector<HTMLTextAreaElement>("#comparisonSetNote")
            ?.value ?? "";
        try {
          const saved = saveComparisonSetForStorage(
            globalThis.localStorage,
            settings,
            {
              title: comparisonSetTitle,
              note: comparisonSetNote,
            },
          );
          comparisonSets = saved.comparisonSets;
          comparisonSetStatus = saved.status;
          comparisonSetTitle = "";
          comparisonSetNote = "";
        } catch (error) {
          comparisonSetStatus =
            error instanceof Error
              ? `Comparison set save failed: ${error.message}`
              : "Comparison set save failed.";
        }
        render();
      });

    root
      .querySelectorAll<HTMLButtonElement>("[data-comparison-set-apply]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const set = comparisonSets.find(
            (candidate) => candidate.id === button.dataset.comparisonSetApply,
          );

          if (!set) {
            return;
          }

          stop();
          settings = normalizeAppSettings(savedComparisonSetToSettings(set));
          visibleGenerations = settings.generations;
          comparisonSetStatus = `Applied comparison set "${set.title}".`;
          history.replaceState(null, "", serializeSettingsQuery(settings));
          render();
        });
      });

    root
      .querySelectorAll<HTMLButtonElement>("[data-comparison-set-remove]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const removed = removeComparisonSetForStorage(
            globalThis.localStorage,
            button.dataset.comparisonSetRemove ?? "",
          );
          comparisonSets = removed.comparisonSets;
          comparisonSetStatus = removed.status;
          render();
        });
      });

    root
      .querySelector<HTMLButtonElement>("[data-action='copy-comparison-sets']")
      ?.addEventListener("click", async () => {
        await copyComparisonSetsForStorage(globalThis.localStorage, (json) => {
          return navigator.clipboard?.writeText(json) ?? Promise.resolve();
        });
        comparisonSetStatus = "Copied comparison sets JSON.";
        render();
      });

    root
      .querySelector<HTMLButtonElement>(
        "[data-action='import-comparison-sets']",
      )
      ?.addEventListener("click", () => {
        comparisonSetsImportText =
          root.querySelector<HTMLTextAreaElement>("#comparisonSetsImport")
            ?.value ?? "";
        try {
          const imported = importComparisonSetsForStorage(
            globalThis.localStorage,
            comparisonSetsImportText,
          );
          comparisonSets = imported.comparisonSets;
          comparisonSetStatus = imported.status;
          comparisonSetsImportText = "";
        } catch (error) {
          comparisonSetStatus =
            error instanceof Error
              ? `Comparison set import failed: ${error.message}`
              : "Comparison set import failed.";
        }
        render();
      });

    root
      .querySelector<HTMLButtonElement>(
        "[data-action='add-generation-annotation']",
      )
      ?.addEventListener("click", () => {
        generationAnnotationLabel =
          root.querySelector<HTMLInputElement>("#annotationLabel")?.value ?? "";
        generationAnnotationNote =
          root.querySelector<HTMLTextAreaElement>("#annotationNote")?.value ??
          "";
        try {
          generationAnnotations = addGenerationAnnotation(
            generationAnnotations,
            {
              generation: visibleGenerations,
              label: generationAnnotationLabel,
              note: generationAnnotationNote,
            },
          );
          generationAnnotationLabel = "";
          generationAnnotationNote = "";
          generationAnnotationStatus = `Added annotation for generation ${visibleGenerations}.`;
        } catch (error) {
          generationAnnotationStatus =
            error instanceof Error
              ? `Annotation failed: ${error.message}`
              : "Annotation failed.";
        }
        render();
      });

    root
      .querySelectorAll<HTMLButtonElement>(
        "[data-generation-annotation-remove]",
      )
      .forEach((button) => {
        button.addEventListener("click", () => {
          generationAnnotations = removeGenerationAnnotation(
            generationAnnotations,
            button.dataset.generationAnnotationRemove ?? "",
          );
          generationAnnotationStatus = "Removed annotation.";
          render();
        });
      });

    root
      .querySelector<HTMLButtonElement>(
        "[data-action='copy-generation-annotations']",
      )
      ?.addEventListener("click", async () => {
        await copyAnnotationsForSession(generationAnnotations, (json) => {
          return navigator.clipboard?.writeText(json) ?? Promise.resolve();
        });
        generationAnnotationStatus = "Copied annotations JSON.";
        render();
      });

    root
      .querySelector<HTMLButtonElement>(
        "[data-action='import-generation-annotations']",
      )
      ?.addEventListener("click", () => {
        generationAnnotationsImportText =
          root.querySelector<HTMLTextAreaElement>(
            "#generationAnnotationsImport",
          )?.value ?? "";
        try {
          const imported = importAnnotationsForSession(
            generationAnnotationsImportText,
          );
          generationAnnotations = imported.annotations;
          generationAnnotationStatus = imported.status;
          generationAnnotationsImportText = "";
        } catch (error) {
          generationAnnotationStatus =
            error instanceof Error
              ? `Annotation import failed: ${error.message}`
              : "Annotation import failed.";
        }
        render();
      });

    root
      .querySelector<HTMLButtonElement>("[data-action='copy-lesson-path-pack']")
      ?.addEventListener("click", async () => {
        await copyLessonPathPackForPaths(listLessonPaths(), (json) => {
          return navigator.clipboard?.writeText(json) ?? Promise.resolve();
        });
        lessonPathPackStatus = "Copied built-in lesson path pack JSON.";
        render();
      });

    root
      .querySelectorAll<HTMLButtonElement>("[data-action='copy-timing-cues']")
      .forEach((button) => {
        button.addEventListener("click", async () => {
          const allLessonPaths = [...listLessonPaths(), ...localLessonPaths];
          const path = allLessonPaths.find(
            (candidate) => candidate.id === button.dataset.timingCuePath,
          );

          if (!path) {
            return;
          }

          await copyTimingCueSheetForLessonPath(
            path,
            (text) => {
              return navigator.clipboard?.writeText(text) ?? Promise.resolve();
            },
            selectedPacingPresetId,
          );
          lessonPathPackStatus = `Copied timing cues for "${path.title}".`;
          render();
        });
      });

    root
      .querySelector<HTMLButtonElement>(
        "[data-action='import-lesson-path-pack']",
      )
      ?.addEventListener("click", () => {
        lessonPathPackImportText =
          root.querySelector<HTMLTextAreaElement>("#lessonPathPackImport")
            ?.value ?? "";
        try {
          const imported = importLessonPathPackForSession(
            lessonPathPackImportText,
          );
          localLessonPaths = imported.lessonPaths;
          lessonPathPackStatus = imported.status;
          lessonPathPackImportText = "";
        } catch (error) {
          lessonPathPackStatus =
            error instanceof Error
              ? `Lesson path pack import failed: ${error.message}`
              : "Lesson path pack import failed.";
        }
        render();
      });

    root
      .querySelector<HTMLButtonElement>("[data-action='import-rle']")
      ?.addEventListener("click", () => {
        rleImportText =
          root.querySelector<HTMLTextAreaElement>("#rleImport")?.value ?? "";
        try {
          const imported = importRleForSettings(rleImportText);
          settings = normalizeAppSettings(imported.settings, {
            comparisonRule: settings.comparisonRule,
          });
          visibleGenerations = settings.generations;
          exportStatus = imported.status;
          rleImportText = "";
          history.replaceState(null, "", serializeSettingsQuery(settings));
        } catch (error) {
          exportStatus =
            error instanceof Error
              ? `RLE import failed: ${error.message}`
              : "RLE import failed.";
        }
        render();
      });

    root
      .querySelector<HTMLButtonElement>("[data-action='download-png']")
      ?.addEventListener("click", async () => {
        try {
          const payload = await downloadPngForSettings(
            settings,
            visibleGenerations,
            createBrowserPngCanvasFactory(document),
            downloadDataUrl,
          );
          exportStatus = `Downloaded ${payload.filename}.`;
        } catch (error) {
          exportStatus =
            error instanceof Error ? error.message : "PNG export failed.";
        }
        render();
      });

    root
      .querySelector<HTMLButtonElement>("[data-action='print-teacher-notes']")
      ?.addEventListener("click", () => {
        const printed = printTeacherNotesForSettings(
          settings,
          visibleGenerations,
          teacherNotesContext,
          teacherNotesPrompts,
        );
        exportStatus = printed
          ? "Prepared teacher notes for printing."
          : "Teacher notes print window was blocked; copy from the generated notes in a new window is unavailable.";
        render();
      });
  };

  const stop = () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  globalThis.addEventListener("keydown", handleKeydown);
  render();
}

export async function copySvgForSettings(
  settings: AutomatonSettings,
  visibleGenerations: number,
  writeText: (value: string) => Promise<void>,
): Promise<void> {
  const svg = exportPatternSvg({
    ...settings,
    generations: visibleGenerations,
  });
  await writeText(svg);
}

export async function copyTextForSettings(
  settings: AutomatonSettings,
  visibleGenerations: number,
  writeText: (value: string) => Promise<void>,
): Promise<void> {
  const text = exportPatternText({
    ...settings,
    generations: visibleGenerations,
  });
  await writeText(text);
}

export async function copyRleForSettings(
  settings: AutomatonSettings,
  visibleGenerations: number,
  writeText: (value: string) => Promise<void>,
): Promise<void> {
  const visibleSettings = { ...settings, generations: visibleGenerations };
  const rows = generateAutomaton(visibleSettings);
  const rle = exportPatternRle(rows, visibleSettings);
  await writeText(rle);
}

export async function copySessionSummaryForState(
  settings: AutomatonSettings & { comparisonRule?: number },
  visibleGenerations: number,
  annotations: readonly GenerationAnnotation[],
  context: TeacherNotesContext | undefined,
  prompts: readonly string[],
  writeText: (value: string) => Promise<void>,
): Promise<void> {
  const appSettings = normalizeAppSettings(settings);
  const visibleSettings = { ...appSettings, generations: visibleGenerations };
  const comparison = compareRules({
    primaryRule: visibleSettings.rule,
    comparisonRule: appSettings.comparisonRule,
    width: visibleSettings.width,
    steps: visibleSettings.generations,
    seed: comparisonSeedFromSettings(visibleSettings),
    wrap: visibleSettings.boundaryMode === "wrap",
  });

  await writeText(
    formatSessionSummary({
      settings: visibleSettings,
      comparison: {
        primaryRule: visibleSettings.rule,
        comparisonRule: appSettings.comparisonRule,
        firstDifferingGeneration: comparison.firstDifferingGeneration,
        totalDifferingCells: comparison.totalDifferingCells,
      },
      context: toSessionSummaryContext(context),
      annotations,
      prompts,
    }),
  );
}

export async function copyWorkshopChecklistForState(
  settings: AutomatonSettings & { comparisonRule?: number },
  visibleGenerations: number,
  context: TeacherNotesContext | undefined,
  prompts: readonly string[],
  writeText: (value: string) => Promise<void>,
  pacingPresetId = "standard",
): Promise<void> {
  const appSettings = normalizeAppSettings(settings);
  const preset = PRESETS.find(
    (candidate) => candidate.rule === appSettings.rule,
  );
  const pacingPreset = getPacingPreset(pacingPresetId);
  const durationMinutes = pacingPreset?.totalMinutes ?? visibleGenerations;
  const title = context?.title ?? preset?.label ?? "Ruleloom Lab workshop";
  const description =
    context?.description ??
    preset?.explanation ??
    "Compare the active rule with the selected comparison rule.";

  await writeText(
    formatWorkshopChecklist({
      title,
      durationMinutes,
      selectedRules: [
        `Rule ${appSettings.rule}`,
        `Rule ${appSettings.comparisonRule}`,
      ],
      selectedPresetNames:
        context?.source === "preset" || !context
          ? [preset?.label, pacingPreset && `${pacingPreset.label} pacing`]
          : [pacingPreset && `${pacingPreset.label} pacing`],
      lessonPathNames: context?.source === "lesson" ? [context.title] : [],
      comparisonFocus: description,
      facilitatorNotes: prompts,
      timingCues: [
        {
          label: pacingPreset ? `${pacingPreset.label} pacing` : "Visible run",
          minutes: durationMinutes,
          prompt: pacingPreset
            ? `Use the ${pacingPreset.totalMinutes}-minute ${pacingPreset.label} pacing preset for this visible lesson context.`
            : `Use ${visibleGenerations} visible rows for comparison and discussion.`,
        },
      ],
      reflectionPrompts: prompts,
    }),
  );
}

export async function copyLessonPathPackForPaths(
  paths: readonly LessonPath[],
  writeText: (value: string) => Promise<void>,
): Promise<void> {
  await writeText(exportLessonPathPack(paths));
}

export async function copyTimingCueSheetForLessonPath(
  path: LessonPath,
  writeText: (value: string) => Promise<void>,
  pacingPresetId = "standard",
): Promise<void> {
  const pacing = applyPacingPresetToLessonPath(path, pacingPresetId);
  await writeText(formatPacingGuide(pacing));
}

export async function copyAnnotationsForSession(
  annotations: readonly GenerationAnnotation[],
  writeText: (value: string) => Promise<void>,
): Promise<void> {
  await writeText(serializeGenerationAnnotations(annotations));
}

export function importAnnotationsForSession(json: string): {
  annotations: GenerationAnnotation[];
  status: string;
} {
  const annotations = parseGenerationAnnotationsJson(json);

  return {
    annotations,
    status: `Imported ${annotations.length} local ${annotations.length === 1 ? "annotation" : "annotations"} for this browser session.`,
  };
}

export function listComparisonSetsForStorage(
  storage: ComparisonSetStorage,
): SavedComparisonSet[] {
  return listComparisonSets(storage);
}

export function saveComparisonSetForStorage(
  storage: ComparisonSetStorage,
  settings: AppSettings,
  draft: { title: string; note?: string },
  options?: ComparisonSetCreateOptions,
): {
  comparisonSets: SavedComparisonSet[];
  status: string;
} {
  const set = createComparisonSetFromSettings(settings, draft, options);
  const comparisonSets = saveComparisonSet(storage, set);

  return {
    comparisonSets,
    status: `Saved comparison set "${set.title}".`,
  };
}

export function removeComparisonSetForStorage(
  storage: ComparisonSetStorage,
  id: string,
): {
  comparisonSets: SavedComparisonSet[];
  status: string;
} {
  return {
    comparisonSets: removeComparisonSet(storage, id),
    status: "Removed comparison set.",
  };
}

export async function copyComparisonSetsForStorage(
  storage: ComparisonSetStorage,
  writeText: (value: string) => Promise<void>,
): Promise<void> {
  await writeText(exportComparisonSetsJson(storage));
}

export function importComparisonSetsForStorage(
  storage: ComparisonSetStorage,
  json: string,
): {
  comparisonSets: SavedComparisonSet[];
  status: string;
} {
  const comparisonSets = importComparisonSetsJson(storage, json);

  return {
    comparisonSets,
    status: `Imported ${comparisonSets.length} saved comparison ${comparisonSets.length === 1 ? "set" : "sets"}.`,
  };
}

export function importLessonPathPackForSession(json: string): {
  lessonPaths: LessonPath[];
  status: string;
} {
  const lessonPaths = importLessonPathPack(json);

  return {
    lessonPaths,
    status: `Imported ${lessonPaths.length} local lesson ${lessonPaths.length === 1 ? "path" : "paths"} for this browser session.`,
  };
}

export function createTeacherNotesForSettings(
  settings: AutomatonSettings & { comparisonRule?: number },
  visibleGenerations: number,
  context?: TeacherNotesContext,
  prompts: string[] = [...DEFAULT_TEACHER_NOTE_PROMPTS],
): string {
  const appSettings = normalizeAppSettings(settings);
  const visibleSettings = { ...appSettings, generations: visibleGenerations };
  const rows = generateAutomaton(visibleSettings).map((row) =>
    row.map((bit) => (bit === 1 ? "#" : ".")).join(""),
  );
  const ruleTable = decodeRule(visibleSettings.rule);
  const comparison = compareRules({
    primaryRule: visibleSettings.rule,
    comparisonRule: appSettings.comparisonRule,
    width: visibleSettings.width,
    steps: visibleSettings.generations,
    seed: comparisonSeedFromSettings(visibleSettings),
    wrap: visibleSettings.boundaryMode === "wrap",
  });

  return formatTeacherNotesHtml({
    settings: visibleSettings,
    comparison: {
      primaryRule: visibleSettings.rule,
      comparisonRule: appSettings.comparisonRule,
      firstDifferingGeneration: comparison.firstDifferingGeneration,
      totalDifferingCells: comparison.totalDifferingCells,
      differingCellsByGeneration: comparison.differingCellsByGeneration,
    },
    context,
    ruleTable: neighborhoods().map((neighborhood) => ({
      neighborhood,
      result: ruleTable[neighborhood],
    })),
    rows,
    prompts,
  });
}

export function printTeacherNotesForSettings(
  settings: AutomatonSettings & { comparisonRule?: number },
  visibleGenerations: number,
  context?: TeacherNotesContext,
  prompts?: string[],
  options?: TeacherNotesPrintOptions,
): boolean {
  return printTeacherNotes(
    createTeacherNotesForSettings(
      settings,
      visibleGenerations,
      context,
      prompts,
    ),
    options,
  );
}

export function importRleForSettings(rleText: string): {
  settings: AutomatonSettings;
  status: string;
} {
  const settings = parseRuleloomRle(rleText);
  return {
    settings,
    status: `Imported Rule ${settings.rule}, ${settings.width} cells, ${settings.generations} rows from RLE.`,
  };
}

export function resolveGalleryApply(
  settings: GalleryAppliedSettings,
  _visibleGenerations: number,
  exampleId: string,
): {
  settings: GalleryAppliedSettings;
  visibleGenerations: number;
  shareQuery: string;
} {
  const applied = applyGalleryExample(settings, exampleId);

  return {
    settings: applied,
    visibleGenerations: 1,
    shareQuery: serializeSettingsQuery(applied),
  };
}

export function resolveLessonPathApply(
  _settings: GalleryAppliedSettings,
  _visibleGenerations: number,
  pathId: string,
  stepIndex: number,
  lessonPaths: readonly LessonPath[] = listLessonPaths(),
): {
  settings: GalleryAppliedSettings;
  visibleGenerations: number;
  shareQuery: string;
} | null {
  const applied = applyLessonPathStepFromPaths(lessonPaths, pathId, stepIndex);

  if (!applied) {
    return null;
  }

  return {
    settings: applied,
    visibleGenerations: 1,
    shareQuery: serializeSettingsQuery(applied),
  };
}

function copyLessonPaths(paths: readonly LessonPath[]): LessonPath[] {
  return paths.map((path) => ({
    ...path,
    steps: path.steps.map((step) => ({
      ...step,
      settings: step.settings ? { ...step.settings } : undefined,
    })),
  }));
}

function toSessionSummaryContext(
  context: TeacherNotesContext | undefined,
): SessionSummaryContext | undefined {
  if (!context) {
    return undefined;
  }

  return {
    source: context.source,
    title: context.title,
    summary: context.description,
  };
}

function renderGenerationAnnotationGroups(
  annotations: readonly GenerationAnnotation[],
): string {
  const generations = new Map<number, GenerationAnnotation[]>();

  for (const annotation of annotations) {
    generations.set(annotation.generation, [
      ...(generations.get(annotation.generation) ?? []),
      annotation,
    ]);
  }

  return [...generations]
    .map(
      ([
        generation,
        groupedAnnotations,
      ]) => `<section class="generation-annotation-group" aria-label="Generation ${generation} annotations">
            <h3>Generation ${generation}</h3>
            ${groupedAnnotations
              .map(
                (
                  annotation,
                ) => `<article data-generation-annotation="${escapeHtml(annotation.id)}">
              <div>
                <strong>${escapeHtml(annotation.label)}</strong>
                ${annotation.note ? `<p>${escapeHtml(annotation.note)}</p>` : ""}
              </div>
              <button type="button" data-generation-annotation-remove="${escapeHtml(annotation.id)}" aria-label="Remove annotation ${escapeHtml(annotation.label)}">Remove</button>
            </article>`,
              )
              .join("")}
          </section>`,
    )
    .join("");
}

function renderComparisonSets(sets: readonly SavedComparisonSet[]): string {
  return [...sets]
    .sort((left, right) => {
      return (
        left.title.localeCompare(right.title) ||
        left.createdAt.localeCompare(right.createdAt) ||
        left.id.localeCompare(right.id)
      );
    })
    .map(
      (set) => `<article data-comparison-set="${escapeHtml(set.id)}">
              <div>
                <strong>${escapeHtml(set.title)}</strong>
                <span>Rule ${set.primaryRule} vs Rule ${set.comparisonRule}</span>
                <small>${set.width} cells · ${set.generations} rows · ${seedModeLabel(set.seedMode)} · ${boundaryModeLabel(set.boundaryMode)}</small>
                ${set.note ? `<p>${escapeHtml(set.note)}</p>` : ""}
              </div>
              <div class="comparison-set-actions">
                <button type="button" data-comparison-set-apply="${escapeHtml(set.id)}" aria-label="Apply comparison set ${escapeHtml(set.title)}">Apply</button>
                <button type="button" data-comparison-set-remove="${escapeHtml(set.id)}" aria-label="Remove comparison set ${escapeHtml(set.title)}">Remove</button>
              </div>
            </article>`,
    )
    .join("");
}

function renderLessonPath(path: LessonPath, pacingPresetId: string): string {
  const pacing = applyPacingPresetToLessonPath(path, pacingPresetId);
  const timingCueSheet = formatPacingGuide(pacing);

  return `<article data-lesson-path="${escapeHtml(path.id)}">
            <div class="lesson-path-header">
              <strong>${escapeHtml(path.title)}</strong>
              <span>${pacing.totalMinutes} min · ${escapeHtml(pacing.preset.label)} · ${escapeHtml(path.audience)}</span>
            </div>
            <p>${escapeHtml(path.summary)}</p>
            <div class="timing-cues" aria-label="${escapeHtml(path.title)} timing cues">
              <div class="timing-cue-heading">
                <strong>${escapeHtml(pacing.preset.label)} timing cues</strong>
                <button type="button" data-action="copy-timing-cues" data-timing-cue-path="${escapeHtml(path.id)}">Copy timing cues</button>
              </div>
              <textarea id="timingCueSheet-${escapeHtml(path.id)}" rows="7" spellcheck="false" readonly>${escapeHtml(timingCueSheet)}</textarea>
            </div>
            <ol>
              ${path.steps
                .map((step, index) => {
                  const cue = pacing.steps[index];
                  return `<li>
                <span>${escapeHtml(step.prompt)}</span>
                ${cue ? `<small>${formatPacingStepSummary(cue)}</small>` : ""}
                <button type="button" data-lesson-path-apply="${escapeHtml(path.id)}" data-lesson-step="${index}" aria-label="Apply ${escapeHtml(path.title)} step ${index + 1}">Apply step ${index + 1}</button>
              </li>`;
                })
                .join("")}
            </ol>
          </article>`;
}

function formatPacingStepSummary(cue: PacedLessonPathStep): string {
  return `${cue.startMinute}-${cue.endMinute} min · ${escapeHtml(cue.phaseLabel)}`;
}

export async function downloadPngForSettings(
  settings: AutomatonSettings,
  visibleGenerations: number,
  factory: PngCanvasFactory,
  download: (dataUrl: string, filename: string) => void,
): Promise<PngExportPayload> {
  const payload = await exportPatternPngDataUrl(settings, factory, {
    visibleGenerations,
  });
  download(payload.dataUrl, payload.filename);
  return payload;
}

export function createBrowserPngCanvasFactory(
  documentRef: Document,
): PngCanvasFactory {
  return {
    createCanvas(width, height) {
      const canvas = documentRef.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("PNG export is unavailable in this browser.");
      }

      return {
        context: {
          get fillStyle() {
            return String(context.fillStyle);
          },
          set fillStyle(value: string) {
            context.fillStyle = value;
          },
          fillRect: (x, y, rectWidth, rectHeight) => {
            context.fillRect(x, y, rectWidth, rectHeight);
          },
        },
        encodePng: () => canvas.toDataURL("image/png"),
      };
    },
  };
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}

async function copyTextFromBrowser(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();

  try {
    if (!document.execCommand("copy")) {
      throw new Error("Clipboard copy is unavailable in this browser.");
    }
  } finally {
    textarea.remove();
  }
}

function readSettings(root: HTMLElement, fallback: AppSettings): AppSettings {
  return {
    rule: readNumber(root, "#rule", fallback.rule),
    comparisonRule: readNumber(
      root,
      "#comparisonRule",
      fallback.comparisonRule,
    ),
    width: readNumber(root, "#width", fallback.width),
    generations: readNumber(root, "#generations", fallback.generations),
    seedMode: root.querySelector<HTMLSelectElement>("#seedMode")
      ?.value as AutomatonSettings["seedMode"],
    boundaryMode: root.querySelector<HTMLSelectElement>("#boundaryMode")
      ?.value as AutomatonSettings["boundaryMode"],
    randomSeed: readNumber(root, "#randomSeed", fallback.randomSeed ?? 1),
    customSeed:
      root.querySelector<HTMLInputElement>("#customSeed")?.value ??
      fallback.customSeed,
  };
}

function readNumber(
  root: HTMLElement,
  selector: string,
  fallback: number,
): number {
  const value = root.querySelector<HTMLInputElement>(selector)?.value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function selectOption(value: string, label: string, selected: string): string {
  return `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`;
}

function boundaryModeLabel(
  boundaryMode: AutomatonSettings["boundaryMode"],
): string {
  return boundaryMode === "wrap" ? "Wrapped edges" : "Fixed zero edges";
}

function seedModeLabel(seedMode: AutomatonSettings["seedMode"]): string {
  if (seedMode === "random") {
    return "Deterministic random";
  }

  if (seedMode === "custom") {
    return "Custom bits";
  }

  return "Center";
}

function galleryDifficultyLabel(difficulty: GalleryDifficulty): string {
  if (difficulty === "beginner") {
    return "Beginner";
  }

  if (difficulty === "intermediate") {
    return "Intermediate";
  }

  return "Advanced";
}

function readGalleryFilters(root: HTMLElement): Required<GalleryFilters> {
  return normalizeGalleryFilters({
    seedMode: root.querySelector<HTMLSelectElement>("#gallerySeedMode")
      ?.value as GalleryFilters["seedMode"],
    boundaryMode: root.querySelector<HTMLSelectElement>("#galleryBoundaryMode")
      ?.value as GalleryFilters["boundaryMode"],
    difficulty: root.querySelector<HTMLSelectElement>("#galleryDifficulty")
      ?.value as GalleryFilters["difficulty"],
  });
}

function normalizeGalleryFilters(
  filters: GalleryFilters = {},
): Required<GalleryFilters> {
  return {
    seedMode: filters.seedMode ?? "all",
    boundaryMode: filters.boundaryMode ?? "all",
    difficulty: filters.difficulty ?? "all",
  };
}

function normalizeAppSettings(
  settings: AutomatonSettings | Partial<AppSettings>,
  overrides: Partial<AppSettings> = {},
): AppSettings {
  return {
    ...settings,
    ...overrides,
    comparisonRule: clamp(
      overrides.comparisonRule ?? settings.comparisonRule ?? 90,
      0,
      255,
    ),
  } as AppSettings;
}

function comparisonSeedFromSettings(
  settings: AutomatonSettings,
): RuleComparisonSeed {
  return {
    mode: settings.seedMode,
    randomSeed: settings.randomSeed,
    customSeed: settings.customSeed,
  };
}

function readComparisonSetsFromBrowserStorage(): SavedComparisonSet[] {
  try {
    return listComparisonSets(globalThis.localStorage);
  } catch {
    return [];
  }
}

function formatFirstDifference(
  firstDifferingGeneration: number | null,
): string {
  return firstDifferingGeneration === null
    ? "None"
    : `Generation ${firstDifferingGeneration}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isFormControlTarget(input: KeyboardShortcutInput): boolean {
  const tagName = input.targetTagName?.toLowerCase();
  return (
    input.targetIsContentEditable === true ||
    ["button", "input", "select", "textarea"].includes(tagName ?? "")
  );
}

function readTargetTagName(target: EventTarget | null): string | undefined {
  const maybeElement = target as { tagName?: unknown } | null;
  return typeof maybeElement?.tagName === "string"
    ? maybeElement.tagName
    : undefined;
}

function readTargetIsContentEditable(target: EventTarget | null): boolean {
  const maybeElement = target as { isContentEditable?: unknown } | null;
  return maybeElement?.isContentEditable === true;
}
