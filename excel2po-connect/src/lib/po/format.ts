/** Date, time and numeric formatting helpers for the PO layout. */

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

  // Excel serial supplied as text
  if (/^\d{5}(\.\d+)?$/.test(text)) return parseExcelDate(Number(text));

  // yyyymmddhhmm
  let m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(text);
  if (m) return makeUTC(+m[1], +m[2], +m[3], +m[4], +m[5]);

  // yyyymmddhh:mm
  m = /^(\d{4})(\d{2})(\d{2})(\d{2}):(\d{2})$/.exec(text);
  if (m) return makeUTC(+m[1], +m[2], +m[3], +m[4], +m[5]);

  // yyyymmdd
  m = /^(\d{4})(\d{2})(\d{2})$/.exec(text);
  if (m) return makeUTC(+m[1], +m[2], +m[3]);

  // yyyy-mm-dd or yyyy/mm/dd
  m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(text);
  if (m) return makeUTC(+m[1], +m[2], +m[3]);

  // dd/mm/yyyy or dd-mm-yyyy
  m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/.exec(text);
  if (m) return makeUTC(+m[3], +m[2], +m[1]);

  const parsed = new Date(text);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function makeUTC(y: number, mo: number, d: number, hh = 0, mm = 0): Date | null {
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  const date = new Date(Date.UTC(y, mo - 1, d, hh, mm));
  if (date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d || date.getUTCHours() !== hh || date.getUTCMinutes() !== mm) return null;
  return date;
}

export function formatPODate(value: unknown): string | null {
  const date = value instanceof Date ? value : parseExcelDate(value);
  if (!date) return null;
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function formatPODateTime(value: unknown): string | null {
  const date = value instanceof Date ? value : parseExcelDate(value);
  if (!date) return null;
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  // Spec requires 13-character datetime: yyyymmddhh:mm
  return `${y}${m}${d}${hh}:${mm}`;
}

/** hh:mm */
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

/** Zero padded integer, e.g. formatInteger(40, 5) -> "00040" */
export function formatInteger(value: unknown, width: number): string {
  const n = toNumber(value);
  const rounded = n === null ? 0 : Math.round(n);
  const sign = rounded < 0 ? "-" : "";
  const digits = String(Math.abs(rounded)).padStart(Math.max(0, width - sign.length), "0");
  let result = sign + digits;
  if (result.length > width) {
    // Truncate from the left to keep rightmost digits (may remove sign if too small)
    result = result.slice(-width);
  }
  return result;
}

/** Zero padded decimal with fixed decimals, e.g. 1409 -> "001409.000" */
export function formatDecimal(
  value: unknown,
  width: number,
  decimals: number,
): string {
  const n = toNumber(value) ?? 0;
  const sign = n < 0 ? "-" : "";
  const absText = Math.abs(n).toFixed(decimals);
  const unsigned = absText.padStart(Math.max(0, width - sign.length), "0");
  let result = sign + unsigned;
  if (result.length > width) {
    result = result.slice(-width);
  }
  return result;
}

/** Ensure a numeric-looking Excel value never renders as 1.23E+17. */
export function toPlainText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") {
    if (Number.isInteger(value)) return BigInt(Math.round(value)).toString();
    return String(value);
  }
  return String(value).trim();
}

export function isValidSSCC(value: string): boolean {
  return /^\d{18}$/.test(value);
}
