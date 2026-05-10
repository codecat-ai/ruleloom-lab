import {
  type AutomatonSettings,
  type Bit,
  type BoundaryMode,
  clampSettings,
} from "./automata";

interface ParsedHeader {
  width: number;
  generations: number;
  rule: number;
}

type RleMetadata = Partial<Record<"rule" | "width" | "generations" | "custom seed" | "boundary mode", string>>;

export function parseRuleloomRle(text: string): AutomatonSettings {
  const lines = text.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
  const metadata = readMetadata(lines);
  const headerIndex = lines.findIndex((line) => isHeaderLike(line));

  if (headerIndex === -1) {
    throw new Error("Missing header line.");
  }

  const header = parseHeader(lines[headerIndex]);
  validateMetadata(metadata, header);

  const body = lines
    .slice(headerIndex + 1)
    .filter((line) => !line.trimStart().startsWith("#"))
    .join("")
    .replace(/\s/g, "");

  const rows = decodeBody(body, header.width);

  if (rows.length !== header.generations) {
    throw new Error(`Generation count mismatch: header has ${header.generations}, body has ${rows.length}.`);
  }

  return clampSettings({
    rule: header.rule,
    width: header.width,
    generations: header.generations,
    seedMode: "custom",
    boundaryMode: parseBoundaryMode(metadata["boundary mode"]),
    customSeed: metadata["custom seed"] ?? rowToSeed(rows[0])
  });
}

function readMetadata(lines: string[]): RleMetadata {
  const metadata: RleMetadata = {};

  for (const line of lines) {
    const match = /^#\s*([^:]+):\s*(.*?)\s*$/.exec(line);
    if (!match) {
      continue;
    }

    const key = match[1].trim().toLowerCase();
    if (key === "rule" || key === "width" || key === "generations" || key === "custom seed" || key === "boundary mode") {
      metadata[key] = match[2];
    }
  }

  return metadata;
}

function isHeaderLike(line: string): boolean {
  return /^\s*x\s*=/.test(line);
}

function parseHeader(line: string): ParsedHeader {
  const match = /^\s*x\s*=\s*(\d+)\s*,\s*y\s*=\s*(\d+)\s*,\s*rule\s*=\s*([^\s,]+)\s*$/i.exec(line);

  if (!match) {
    throw new Error("Malformed RLE header line.");
  }

  const ruleMarker = match[3];
  const ruleMatch = /^W(\d+)$/i.exec(ruleMarker);
  if (!ruleMatch) {
    throw new Error(`Unsupported rule marker "${ruleMarker}". Ruleloom imports require W<number>.`);
  }

  return {
    width: Number(match[1]),
    generations: Number(match[2]),
    rule: Number(ruleMatch[1])
  };
}

function validateMetadata(metadata: RleMetadata, header: ParsedHeader): void {
  validateNumberMetadata("rule", metadata.rule, header.rule);
  validateNumberMetadata("width", metadata.width, header.width);
  validateNumberMetadata("generations", metadata.generations, header.generations);
}

function validateNumberMetadata(name: string, value: string | undefined, expected: number): void {
  if (value === undefined) {
    return;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed !== expected) {
    throw new Error(`Metadata ${name} mismatch: expected ${expected}.`);
  }
}

function decodeBody(body: string, width: number): Bit[][] {
  if (!body.endsWith("!")) {
    throw new Error("RLE body must end with !.");
  }

  const source = body.slice(0, -1);
  if (source.length === 0) {
    throw new Error("Empty body.");
  }

  const rows: Bit[][] = [];
  let currentRow: Bit[] = [];
  let countBuffer = "";

  for (const token of source) {
    if (/\d/.test(token)) {
      countBuffer += token;
      continue;
    }

    const count = countBuffer === "" ? 1 : Number(countBuffer);
    countBuffer = "";

    if (!Number.isSafeInteger(count) || count < 1) {
      throw new Error("Malformed run count in RLE body.");
    }

    if (token === "b" || token === "o") {
      const bit: Bit = token === "o" ? 1 : 0;
      currentRow.push(...Array.from({ length: count }, () => bit));
      continue;
    }

    if (token === "$") {
      for (let index = 0; index < count; index += 1) {
        pushValidatedRow(rows, currentRow, width);
        currentRow = [];
      }
      continue;
    }

    throw new Error(`Malformed run token "${token}" in RLE body.`);
  }

  if (countBuffer !== "") {
    throw new Error("Malformed run count at end of RLE body.");
  }

  pushValidatedRow(rows, currentRow, width);
  return rows;
}

function pushValidatedRow(rows: Bit[][], row: Bit[], width: number): void {
  if (row.length !== width) {
    throw new Error(`Width mismatch: expected ${width} cells, found ${row.length}.`);
  }

  rows.push(row);
}

function parseBoundaryMode(value: string | undefined): BoundaryMode {
  return value === "wrap" ? "wrap" : "fixed";
}

function rowToSeed(row: Bit[] | undefined): string {
  return row?.join("") ?? "";
}
