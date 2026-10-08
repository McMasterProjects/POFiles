import * as XLSX from "xlsx";
import { PALLET_FIELDS } from "./types";

export interface SheetInfo {
  name: string;
  rowCount: number;
  columnCount: number;
}

export interface WorkbookInspection {
  worksheets: SheetInfo[];
  sheetName: string;
  headers: string[];
  rowCount: number;
  previewRows: Record<string, string>[];
}

function decodeTransmission(base64: string): string {
  return Buffer.from(base64, "base64").toString("latin1");
}

export function isPaltrackTransmission(base64: string): boolean {
  return decodeTransmission(base64)
    .split(/\r?\n/)
    .some((line) => line.slice(0, 2) === "OP");
}

function transmissionRows(base64: string): Record<string, string>[] {
  return decodeTransmission(base64)
    .split(/\r?\n/)
    .filter((line) => line.slice(0, 2) === "OP")
    .map((line) =>
      Object.fromEntries(
        PALLET_FIELDS.map((field) => [field.key, line.slice(field.from - 1, field.to).trim()]),
      ),
    );
}

export function inspectTransmission(base64: string, previewLimit = 20): WorkbookInspection {
  const rows = transmissionRows(base64);
  const headers = PALLET_FIELDS.map((field) => field.key);
  return {
    worksheets: [{ name: "PO", rowCount: rows.length, columnCount: headers.length }],
    sheetName: "PO",
    headers,
    rowCount: rows.length,
    previewRows: rows.slice(0, previewLimit),
  };
}

function sheetMatrix(ws: XLSX.WorkSheet): string[][] {
  return XLSX.utils.sheet_to_json<string[]>(ws, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: false,
  }) as unknown as string[][];
}

export function readWorkbook(base64: string): XLSX.WorkBook {
  return XLSX.read(base64, { type: "base64", cellDates: false, cellText: true });
}

export function inspectWorkbook(
  base64: string,
  sheetName?: string,
  previewLimit = 20,
): WorkbookInspection {
  const wb = readWorkbook(base64);
  const worksheets: SheetInfo[] = wb.SheetNames.map((name) => {
    const matrix = sheetMatrix(wb.Sheets[name]);
    return {
      name,
      rowCount: Math.max(matrix.length - 1, 0),
      columnCount: matrix[0]?.length ?? 0,
    };
  });

  const selected = sheetName && wb.SheetNames.includes(sheetName) ? sheetName : wb.SheetNames[0];
  const matrix = sheetMatrix(wb.Sheets[selected]);
  const headers = (matrix[0] ?? []).map((h, i) => String(h ?? "").trim() || `Column ${i + 1}`);
  const dataRows = matrix.slice(1);

  const previewRows = dataRows
    .slice(0, previewLimit)
    .map((row) => Object.fromEntries(headers.map((h, i) => [h, String(row[i] ?? "")])));

  return {
    worksheets,
    sheetName: selected,
    headers,
    rowCount: dataRows.length,
    previewRows,
  };
}

export function readSheetRows(
  base64: string,
  sheetName: string,
): { headers: string[]; rows: Record<string, string>[] } {
  if (isPaltrackTransmission(base64)) {
    return { headers: PALLET_FIELDS.map((field) => field.key), rows: transmissionRows(base64) };
  }

  const wb = readWorkbook(base64);
  const name = wb.SheetNames.includes(sheetName) ? sheetName : wb.SheetNames[0];
  const matrix = sheetMatrix(wb.Sheets[name]);
  const headers = (matrix[0] ?? []).map((h, i) => String(h ?? "").trim() || `Column ${i + 1}`);
  const rows = matrix
    .slice(1)
    .map((row) => Object.fromEntries(headers.map((h, i) => [h, String(row[i] ?? "").trim()])))
    .filter((row) => Object.values(row).some((v) => v !== ""));
  return { headers, rows };
}
