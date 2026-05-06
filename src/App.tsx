import {
  type AutomatonSettings,
  decodeRule,
  generateAutomaton,
  neighborhoods,
  MAX_GENERATIONS,
  MAX_WIDTH,
  MIN_GENERATIONS,
  MIN_WIDTH
} from "./automata";
import { DEFAULT_SETTINGS, parseSettingsQuery, serializeSettingsQuery } from "./share";
import { exportPatternSvg } from "./svgExport";
import "./App.css";

const PRESETS = [
  {
    label: "Rule 30",
    rule: 30,
    explanation: "Chaotic, pseudo-random growth from a simple deterministic rule."
  },
  {
    label: "Rule 90",
    rule: 90,
    explanation: "Creates nested Sierpinski triangles that reveal self-similarity."
  },
  {
    label: "Rule 110",
    rule: 110,
    explanation: "Computationally universal behavior with persistent moving structures."
  },
  {
    label: "Rule 184",
    rule: 184,
    explanation: "Models traffic flow as particles moving through local gaps."
  }
] as const;

export function getPresetExplanations(): Array<(typeof PRESETS)[number]> {
  return [...PRESETS];
}

export function createAppHtml(settings: AutomatonSettings = DEFAULT_SETTINGS): string {
  const rows = generateAutomaton(settings);
  const ruleTable = decodeRule(settings.rule);

  return `
    <main class="shell">
      <section class="intro">
        <div>
          <p class="eyebrow">Elementary cellular automata</p>
          <h1>Ruleloom Lab</h1>
          <p class="lede">Explore how three-cell neighborhood rules weave complex local-first patterns.</p>
        </div>
        <div class="status" aria-live="polite">
          <span>Rule ${settings.rule}</span>
          <span>${settings.width} cells</span>
          <span>${settings.generations} rows</span>
          <span>${boundaryModeLabel(settings.boundaryMode)}</span>
        </div>
      </section>

      <section class="controls" aria-label="Simulation controls">
        <label>
          Rule
          <input id="rule" type="number" min="0" max="255" value="${settings.rule}" />
        </label>
        <label>
          Width
          <input id="width" type="number" min="${MIN_WIDTH}" max="${MAX_WIDTH}" value="${settings.width}" />
        </label>
        <label>
          Generations
          <input id="generations" type="number" min="${MIN_GENERATIONS}" max="${MAX_GENERATIONS}" value="${settings.generations}" />
        </label>
        <label>
          Seed
          <select id="seedMode">
            ${selectOption("center", "Center", settings.seedMode)}
            ${selectOption("random", "Deterministic random", settings.seedMode)}
            ${selectOption("custom", "Custom bits", settings.seedMode)}
          </select>
        </label>
        <label>
          Boundary
          <select id="boundaryMode">
            ${selectOption("fixed", "Fixed zero edges", settings.boundaryMode ?? "fixed")}
            ${selectOption("wrap", "Wrapped circular edges", settings.boundaryMode ?? "fixed")}
          </select>
        </label>
        <label>
          Random seed
          <input id="randomSeed" type="number" value="${settings.randomSeed ?? 1}" />
        </label>
        <label class="wide">
          Custom bits
          <input id="customSeed" type="text" inputmode="numeric" value="${escapeHtml(settings.customSeed ?? "")}" />
        </label>
      </section>

      <section class="actions" aria-label="Run controls">
        ${PRESETS.map((preset) => `<button type="button" data-preset="${preset.rule}" aria-label="${preset.label} preset">${preset.label}</button>`).join("")}
        <button type="button" data-action="step">Step</button>
        <button type="button" data-action="reset">Reset</button>
        <button type="button" data-action="run">Run</button>
        <button type="button" data-action="share">Copy share URL</button>
        <button type="button" data-action="copy-svg">Copy SVG</button>
      </section>

      <section class="preset-explanations" aria-label="Preset explanations">
        ${PRESETS.map((preset) => `<article data-preset-explanation="${preset.rule}"><strong>${preset.label}</strong><span>${preset.explanation}</span></article>`).join("")}
      </section>

      <section class="layout">
        <table class="rule-table" aria-label="Rule table">
          <thead>
            <tr>${neighborhoods().map((neighborhood) => `<th><code>${neighborhood}</code></th>`).join("")}</tr>
          </thead>
          <tbody>
            <tr>${neighborhoods().map((neighborhood) => `<td>${ruleTable[neighborhood]}</td>`).join("")}</tr>
          </tbody>
        </table>

        <div class="grid-wrap">
          <div class="automaton-grid" role="grid" aria-label="Automaton grid" style="--cells: ${settings.width}">
            ${rows.map((row, rowIndex) => row.map((bit, columnIndex) => `<span role="gridcell" class="cell ${bit ? "alive" : ""}" aria-label="row ${rowIndex + 1}, cell ${columnIndex + 1}, ${bit ? "alive" : "empty"}"></span>`).join("")).join("")}
          </div>
        </div>
      </section>
    </main>
  `;
}

export function mountApp(root: HTMLElement): void {
  let settings = parseSettingsQuery(globalThis.location?.search ?? "");
  let visibleGenerations = settings.generations;
  let timer: number | undefined;

  const render = () => {
    root.innerHTML = createAppHtml({ ...settings, generations: visibleGenerations });
    bindEvents();
  };

  const updateFromControls = () => {
    settings = parseSettingsQuery(serializeSettingsQuery(readSettings(root, settings)));
    visibleGenerations = settings.generations;
    history.replaceState(null, "", serializeSettingsQuery(settings));
    render();
  };

  const bindEvents = () => {
    root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select").forEach((control) => {
      control.addEventListener("change", updateFromControls);
    });

    root.querySelectorAll<HTMLButtonElement>("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        settings = { ...settings, rule: Number(button.dataset.preset) };
        history.replaceState(null, "", serializeSettingsQuery(settings));
        render();
      });
    });

    root.querySelector<HTMLButtonElement>("[data-action='step']")?.addEventListener("click", () => {
      visibleGenerations = Math.min(MAX_GENERATIONS, visibleGenerations + 1);
      render();
    });

    root.querySelector<HTMLButtonElement>("[data-action='reset']")?.addEventListener("click", () => {
      stop();
      visibleGenerations = 1;
      render();
    });

    root.querySelector<HTMLButtonElement>("[data-action='run']")?.addEventListener("click", () => {
      if (timer !== undefined) {
        stop();
        return;
      }
      timer = globalThis.setInterval(() => {
        visibleGenerations = visibleGenerations >= settings.generations ? 1 : visibleGenerations + 1;
        render();
      }, 180);
    });

    root.querySelector<HTMLButtonElement>("[data-action='share']")?.addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}${serializeSettingsQuery(settings)}`;
      await navigator.clipboard?.writeText(url);
    });

    root.querySelector<HTMLButtonElement>("[data-action='copy-svg']")?.addEventListener("click", async () => {
      await copySvgForSettings(settings, visibleGenerations, (svg) => {
        return navigator.clipboard?.writeText(svg) ?? Promise.resolve();
      });
    });
  };

  const stop = () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  render();
}

export async function copySvgForSettings(
  settings: AutomatonSettings,
  visibleGenerations: number,
  writeText: (value: string) => Promise<void>
): Promise<void> {
  const svg = exportPatternSvg({ ...settings, generations: visibleGenerations });
  await writeText(svg);
}

function readSettings(root: HTMLElement, fallback: AutomatonSettings): AutomatonSettings {
  return {
    rule: readNumber(root, "#rule", fallback.rule),
    width: readNumber(root, "#width", fallback.width),
    generations: readNumber(root, "#generations", fallback.generations),
    seedMode: root.querySelector<HTMLSelectElement>("#seedMode")?.value as AutomatonSettings["seedMode"],
    boundaryMode: root.querySelector<HTMLSelectElement>("#boundaryMode")?.value as AutomatonSettings["boundaryMode"],
    randomSeed: readNumber(root, "#randomSeed", fallback.randomSeed ?? 1),
    customSeed: root.querySelector<HTMLInputElement>("#customSeed")?.value ?? fallback.customSeed
  };
}

function readNumber(root: HTMLElement, selector: string, fallback: number): number {
  const value = root.querySelector<HTMLInputElement>(selector)?.value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function selectOption(value: string, label: string, selected: string): string {
  return `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`;
}

function boundaryModeLabel(boundaryMode: AutomatonSettings["boundaryMode"]): string {
  return boundaryMode === "wrap" ? "Wrapped edges" : "Fixed zero edges";
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
