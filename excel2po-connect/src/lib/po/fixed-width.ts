/**
 * Fixed-width field helper.
 * Positions are 1-based and inclusive. All records are space-padded blanks
 * of a known length, and fields are written into exact character positions.
 */

export type FieldAlign = "alpha" | "numeric";

export interface FieldOptions {
  /** alpha = left aligned + space padded, numeric = right aligned + zero padded */
  align?: FieldAlign;
  /** allow silent truncation of alpha values that exceed the field width */
  allowTruncate?: boolean;
  /** pad character override */
  pad?: string;
  /** field name for error reporting */
  field?: string;
  /** record type for error reporting */
  recordType?: string;
  /** excel row for error reporting */
  excelRow?: number;
}

export interface FixedWidthError {
  code: string;
  message: string;
  recordType?: string;
  excelRow?: number;
  field?: string;
  fromPosition?: number;
  toPosition?: number;
  expectedLength?: number;
  actualLength?: number;
  value?: string;
  severity: "error" | "warning";
}

export function blankLine(length: number): string {
  return " ".repeat(length);
}

export function setFixedWidthField(
  buffer: string,
  fromPosition: number,
  toPosition: number,
  value: unknown,
  options: FieldOptions = {},
): { buffer: string; errors: FixedWidthError[] } {
  const errors: FixedWidthError[] = [];
  const {
    align = "alpha",
    allowTruncate = align === "numeric" ? false : false,
    field,
    recordType,
    excelRow,
  } = options;

  const width = toPosition - fromPosition + 1;

  if (width <= 0) {
    throw new Error(
      `Invalid field definition ${recordType ?? ""}.${field ?? ""}: ${fromPosition}-${toPosition}`,
    );
  }
  if (fromPosition < 1 || toPosition > buffer.length) {
    throw new Error(
      `Field ${recordType ?? ""}.${field ?? ""} (${fromPosition}-${toPosition}) falls outside record length ${buffer.length}`,
    );
  }

  let raw = value === null || value === undefined ? "" : String(value);
  raw = raw.trim();

  if (raw.length > width) {
    if (allowTruncate) {
      errors.push({
        code: "FIELD_TRUNCATED",
        severity: "warning",
        message: `Value "${raw}" was truncated to ${width} characters.`,
        recordType,
        excelRow,
        field,
        fromPosition,
        toPosition,
        expectedLength: width,
        actualLength: raw.length,
        value: raw,
      });
      raw = raw.slice(0, width);
    } else {
      errors.push({
        code: "INVALID_FIELD_LENGTH",
        severity: "error",
        message: `${field ?? "Field"} must be at most ${width} characters.`,
        recordType,
        excelRow,
        field,
        fromPosition,
        toPosition,
        expectedLength: width,
        actualLength: raw.length,
        value: raw,
      });
      raw = raw.slice(0, width);
    }
  }

  const padChar = options.pad ?? (align === "numeric" ? "0" : " ");
  const padded =
    align === "numeric"
      ? raw.padStart(width, raw === "" ? " " : padChar)
      : raw.padEnd(width, padChar);

  const next = buffer.slice(0, fromPosition - 1) + padded + buffer.slice(toPosition);

  if (next.length !== buffer.length) {
    throw new Error(
      `Writing ${recordType ?? ""}.${field ?? ""} changed record length (${buffer.length} -> ${next.length})`,
    );
  }

  return { buffer: next, errors };
}

/** Small builder that accumulates errors while writing fields. */
export class RecordWriter {
  buffer: string;
  errors: FixedWidthError[] = [];

  constructor(
    private readonly length: number,
    private readonly recordType: string,
    private readonly excelRow?: number,
  ) {
    this.buffer = blankLine(length);
  }

  put(
    from: number,
    to: number,
    value: unknown,
    options: Omit<FieldOptions, "recordType" | "excelRow"> = {},
  ): this {
    const result = setFixedWidthField(this.buffer, from, to, value, {
      ...options,
      recordType: this.recordType,
      excelRow: this.excelRow,
    });
    this.buffer = result.buffer;
    this.errors.push(...result.errors);
    return this;
  }

  num(from: number, to: number, value: unknown, options: Omit<FieldOptions, "align"> = {}): this {
    return this.put(from, to, value, { ...options, align: "numeric" });
  }

  done(): { line: string; errors: FixedWidthError[] } {
    if (this.buffer.length !== this.length) {
      this.errors.push({
        code: "INVALID_RECORD_LENGTH",
        severity: "error",
        message: `${this.recordType} record must be exactly ${this.length} characters (actual ${this.buffer.length}).`,
        recordType: this.recordType,
        excelRow: this.excelRow,
        expectedLength: this.length,
        actualLength: this.buffer.length,
      });
    }
    return { line: this.buffer, errors: this.errors };
  }
}
