import { type Bit, type BoundaryMode, type SeedMode } from "./automata";

export interface RleExportMetadata {
  rule: number;
  width: number;
  seedMode: SeedMode;
  boundaryMode?: BoundaryMode;
  randomSeed?: number;
  customSeed?: string;
}

export function exportPatternRle(rows: Bit[][], metadata: RleExportMetadata): string {
  const generations = rows.length;
  const lines = [
    "# Ruleloom Lab",
    `# rule: ${metadata.rule}`,
    `# width: ${metadata.width}`,
    `# generations: ${generations}`,
    `# seed mode: ${metadata.seedMode}`,
    `# boundary mode: ${metadata.boundaryMode ?? "fixed"}`
  ];

  if (metadata.seedMode === "random" && metadata.randomSeed !== undefined) {
    lines.push(`# random seed: ${metadata.randomSeed}`);
  }

  if (metadata.seedMode === "custom" && metadata.customSeed !== undefined) {
    lines.push(`# custom seed: ${metadata.customSeed}`);
  }

  lines.push(`x = ${metadata.width}, y = ${generations}, rule = W${metadata.rule}`);
  lines.push(`${encodeRows(rows)}!`);

  return lines.join("\n");
}

function encodeRows(rows: Bit[][]): string {
  return rows.map(encodeRow).join("$");
}

function encodeRow(row: Bit[]): string {
  if (row.length === 0) {
    return "";
  }

  const runs: string[] = [];
  let current = row[0];
  let count = 1;

  for (const bit of row.slice(1)) {
    if (bit === current) {
      count += 1;
    } else {
      runs.push(encodeRun(current, count));
      current = bit;
      count = 1;
    }
  }

  runs.push(encodeRun(current, count));
  return runs.join("");
}

function encodeRun(bit: Bit, count: number): string {
  return `${count === 1 ? "" : count}${bit === 1 ? "o" : "b"}`;
}
