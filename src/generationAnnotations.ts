export const GENERATION_ANNOTATIONS_SCHEMA_VERSION = 1;
export const MAX_GENERATION_ANNOTATION_LABEL_LENGTH = 80;

export interface GenerationAnnotation {
  id: string;
  generation: number;
  label: string;
  note?: string;
  createdAt: string;
}

export interface AddGenerationAnnotationInput {
  generation: number;
  label: string;
  note?: string;
}

export interface GenerationAnnotationOptions {
  createId?: () => string;
  now?: () => string;
  maxLabelLength?: number;
}

interface GenerationAnnotationExport {
  schemaVersion: typeof GENERATION_ANNOTATIONS_SCHEMA_VERSION;
  annotations: GenerationAnnotation[];
}

export function addGenerationAnnotation(
  annotations: readonly GenerationAnnotation[],
  input: AddGenerationAnnotationInput,
  options: GenerationAnnotationOptions = {},
): GenerationAnnotation[] {
  const maxLabelLength =
    options.maxLabelLength ?? MAX_GENERATION_ANNOTATION_LABEL_LENGTH;
  const label = validateLabel(input.label, "label", maxLabelLength);
  const note = normalizeOptionalNote(input.note, "note");
  const generation = validateGeneration(input.generation, "generation");
  const id = validateNonEmptyString(
    options.createId?.() ?? crypto.randomUUID(),
    "id",
  );
  const createdAt = validateIsoString(
    options.now?.() ?? new Date().toISOString(),
    "createdAt",
  );

  return sortGenerationAnnotations([
    ...annotations,
    {
      id,
      generation,
      label,
      ...(note ? { note } : {}),
      createdAt,
    },
  ]);
}

export function removeGenerationAnnotation(
  annotations: readonly GenerationAnnotation[],
  id: string,
): GenerationAnnotation[] {
  return annotations.filter((annotation) => annotation.id !== id);
}

export function sortGenerationAnnotations(
  annotations: readonly GenerationAnnotation[],
): GenerationAnnotation[] {
  return [...annotations].sort((left, right) => {
    return (
      left.generation - right.generation ||
      left.createdAt.localeCompare(right.createdAt) ||
      left.label.localeCompare(right.label)
    );
  });
}

export function serializeGenerationAnnotations(
  annotations: readonly GenerationAnnotation[],
): string {
  return JSON.stringify(
    {
      schemaVersion: GENERATION_ANNOTATIONS_SCHEMA_VERSION,
      annotations: sortGenerationAnnotations(annotations),
    } satisfies GenerationAnnotationExport,
    null,
    2,
  );
}

export function parseGenerationAnnotationsJson(
  json: string,
): GenerationAnnotation[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Annotation JSON is not valid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Annotation JSON must be an object.");
  }

  if (parsed.schemaVersion !== GENERATION_ANNOTATIONS_SCHEMA_VERSION) {
    throw new Error("Annotation JSON schemaVersion must be 1.");
  }

  if (!Array.isArray(parsed.annotations)) {
    throw new Error("Annotation JSON needs an annotations array.");
  }

  return sortGenerationAnnotations(
    parsed.annotations.map((annotation, index) =>
      validateAnnotation(annotation, index),
    ),
  );
}

function validateAnnotation(
  value: unknown,
  index: number,
): GenerationAnnotation {
  const label = `annotations[${index}]`;

  if (!isRecord(value)) {
    throw new Error(`${label} must be an object.`);
  }

  const note = normalizeOptionalNote(value.note, `${label}.note`);

  return {
    id: validateNonEmptyString(value.id, `${label}.id`),
    generation: validateGeneration(value.generation, `${label}.generation`),
    label: validateLabel(
      value.label,
      `${label}.label`,
      MAX_GENERATION_ANNOTATION_LABEL_LENGTH,
    ),
    ...(note ? { note } : {}),
    createdAt: validateIsoString(value.createdAt, `${label}.createdAt`),
  };
}

function validateGeneration(value: unknown, label: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }

  return value;
}

function validateLabel(
  value: unknown,
  label: string,
  maxLabelLength: number,
): string {
  const text = validateNonEmptyString(value, label);

  if (text.length > maxLabelLength) {
    throw new Error(`${label} must be ${maxLabelLength} characters or fewer.`);
  }

  return text;
}

function normalizeOptionalNote(
  value: unknown,
  label: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${label} must be a string when provided.`);
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function validateNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} is required.`);
  }

  return value.trim();
}

function validateIsoString(value: unknown, label: string): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be an ISO date string.`);
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
