
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

export function parseExcelDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  if (typeof value === "number" && isFinite(value)) {
    if (value <= 0 || value > 60000) return null;
    return new Date(EXCEL_EPOCH_UTC + Math.round(value) * 86400000);
  }

  const text = String(value).trim();
  if (!text) return null;

  if (/^\d{5}(\.\d+)?$/.test(text)) return parseExcelDate(Number(text));

  let m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(text);
  if (m) return makeUTC(+m[1], +m[2], +m[3], +m[4], +m[5]);

  m = /^(\d{4})(\d{2})(\d{2})(\d{2}):(\d{2})$/.exec(text);
  if (m) return makeUTC(+m[1], +m[2], +m[3], +m[4], +m[5]);

  m = /^(\d{4})(\d{2})(\d{2})$/.exec(text);
  if (m) return makeUTC(+m[1], +m[2], +m[3]);

  m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(text);
  if (m) return makeUTC(+m[1], +m[2], +m[3]);

  m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/.exec(text);
  if (m) return makeUTC(+m[3], +m[2], +m[1]);

  const parsed = new Date(text);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function makeUTC(
  y: number,
  mo: number,
  d: number,
  hh = 0,
  mm = 0
): Date | null {
  if (
    mo < 1 ||
    mo > 12 ||
    d < 1 ||
    d > 31 ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59
  ) {
    return null;
  }

  const date = new Date(Date.UTC(y, mo - 1, d, hh, mm));

  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== mo - 1 ||
    date.getUTCDate() !== d ||
    date.getUTCHours() !== hh ||
    date.getUTCMinutes() !== mm
  ) {
    return null;
  }

  return date;
}

// Standard PO date: yyyyMMdd
export function formatPODate(value: unknown): string | null {
  const date = value instanceof Date ? value : parseExcelDate(value);
  if (!date || Number.isNaN(date.getTime())) return null;

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");

  return `${y}${m}${d}`;
}

// PO date-time: yyyyMMddHH:mm
export function formatPODateTime(value: unknown): string | null {
  const date = value instanceof Date ? value : parseExcelDate(value);
  if (!date || Number.isNaN(date.getTime())) return null;

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");

  return `${y}${m}${d}${hh}:${mm}`;
}

// Shipped date: yyyy/MM/dd

export function formatShippedDate(value: unknown): string | null {
  const date = value instanceof Date ? value : parseExcelDate(value);

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}
export function formatPOTime(date: Date = new Date()): string {
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");

  return `${h}:${m}`;
}

export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return isFinite(value) ? value : null;

  const text = String(value).trim().replace(/\s/g, "").replace(/,/g, "");
  if (!text || !/^-?\d*\.?\d+$/.test(text)) return null;

  const n = Number(text);
  return isFinite(n) ? n : null;
}

export function formatInteger(value: unknown, width: number): string {
  const n = toNumber(value);
  const rounded = n === null ? 0 : Math.round(n);
  const sign = rounded < 0 ? "-" : "";
  const digits = String(Math.abs(rounded)).padStart(
    Math.max(0, width - sign.length),
    "0"
  );

  const result = sign + digits;
  return result;
}

export function formatDecimal(
  value: unknown,
  width: number,
  decimals: number
): string {
  const n = toNumber(value) ?? 0;
  const sign = n < 0 ? "-" : "";
  const absText = Math.abs(n).toFixed(decimals);
  const unsigned = absText.padStart(
    Math.max(0, width - sign.length),
    "0"
  );

  const result = sign + unsigned;
  return result;
}

export function toPlainText(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return BigInt(Math.round(value)).toString();
    }
    return String(value);
  }

  return String(value).trim();
}

export interface SSCCValidationResult {
  success: boolean;
  value: string;
  error?: string;
}

export interface PalletRow {
  rowNumber: number;
  organisationCode: string;
  sscc?: string | number | null;
  barcode?: string | number | null;
}

export interface ValidationError {
  rowNumber: number;
  field: string;
  message: string;
}

export interface ProcessedPalletRow extends PalletRow {
  formattedSSCC: string;
}

export function isValidSSCC(value: string): boolean {
  return /^\d{18}$/.test(value);
}

export function validateAndFormatSSCC(
  barcodeOrSSCC: unknown,
  organisationCode: unknown
): SSCCValidationResult {
  const sscc = String(barcodeOrSSCC ?? "").trim();
  const organisation = String(organisationCode ?? "").trim().toUpperCase();

  if (!sscc) {
    return {
      success: false,
      value: "",
      error: "SSCC/barcode is required.",
    };
  }

  if (!organisation) {
    return {
      success: false,
      value: sscc,
      error: "Organisation code is required.",
    };
  }

  if (!/^\d+$/.test(sscc)) {
    return {
      success: false,
      value: sscc,
      error: `SSCC/barcode must contain digits only. Received: "${sscc}".`,
    };
  }

  if (sscc.length > 18) {
    return {
      success: false,
      value: sscc,
      error: `SSCC/barcode cannot exceed 18 characters. Received ${sscc.length} characters.`,
    };
  }

  if (organisation === "AO" && sscc.length < 18) {
    return {
      success: true,
      value: sscc.padEnd(18, "0"),
    };
  }

  if (organisation !== "AO" && sscc.length < 18) {
    return {
      success: false,
      value: sscc,
      error:
        `SSCC/barcode must contain exactly 18 characters for ` +
        `organisation ${organisation}. Received ${sscc.length} characters.`,
    };
  }

  return {
    success: true,
    value: sscc,
  };
}

export function processPalletRows(rows: PalletRow[]): {
  validRows: ProcessedPalletRow[];
  errors: ValidationError[];
} {
  const validRows: ProcessedPalletRow[] = [];
  const errors: ValidationError[] = [];

  for (const row of rows) {
    const originalSSCC = row.sscc ?? row.barcode;

    const result = validateAndFormatSSCC(
      originalSSCC,
      row.organisationCode
    );

    if (!result.success) {
      errors.push({
        rowNumber: row.rowNumber,
        field: "SSCC/barcode",
        message: result.error ?? "Invalid SSCC/barcode.",
      });
      continue;
    }

    validRows.push({
      ...row,
      formattedSSCC: result.value,
    });
  }

  return {
    validRows,
    errors,
  };
}
