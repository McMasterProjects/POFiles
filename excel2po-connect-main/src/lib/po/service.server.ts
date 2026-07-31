/** Backend orchestration for the Excel → PO conversion pipeline. */
import { inspectWorkbook, readSheetRows } from "./excel.server";
import { applyMapping, suggestHeaderValues, suggestMapping } from "./mapping";
import { generatePOFile, getNextSequenceNumber } from "./generator";
import { logEvent, newId, pushLogs, store, type ConversionRecord } from "./store.server";
import type { ColumnMapping, POHeaderInput, ValidationIssue } from "./types";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export function handleUpload(input: {
  fileName: string;
  fileSize: number;
  base64: string;
  sheetName?: string;
}) {
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  if (!safeName.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Only .xlsx files are accepted.");
  }
  if (input.fileSize > MAX_UPLOAD_BYTES) {
    throw new Error("File exceeds the 20 MB upload limit.");
  }

  const uploadId = newId("UPL");
  const inspection = inspectWorkbook(input.base64, input.sheetName);
  const suggestedHeaderValues = suggestHeaderValues(inspection.headers, inspection.previewRows);

  store.uploads.set(uploadId, {
    uploadId,
    fileName: safeName,
    fileSize: input.fileSize,
    base64: input.base64,
    uploadedAt: new Date().toISOString(),
  });

  logEvent(uploadId, "upload", "File received", { message: safeName });
  logEvent(uploadId, "excel-reader", "Excel opened", {
    message: `${inspection.worksheets.length} worksheet(s)`,
  });
  logEvent(uploadId, "excel-reader", "Worksheet selected", { message: inspection.sheetName });
  logEvent(uploadId, "excel-reader", "Headers detected", {
    message: inspection.headers.join(", ").slice(0, 400),
  });

  return {
    uploadId,
    fileName: safeName,
    fileSize: input.fileSize,
    uploadedAt: new Date().toISOString(),
    suggestedMapping: suggestMapping(inspection.headers),
    suggestedHeaderValues,
    ...inspection,
  };
}

export function inspectSheet(uploadId: string, sheetName: string) {
  const upload = requireUpload(uploadId);
  const inspection = inspectWorkbook(upload.base64, sheetName);
  logEvent(uploadId, "excel-reader", "Worksheet selected", { message: inspection.sheetName });
  return {
    ...inspection,
    suggestedMapping: suggestMapping(inspection.headers),
    suggestedHeaderValues: suggestHeaderValues(inspection.headers, inspection.previewRows),
  };
}

function requireUpload(uploadId: string) {
  const upload = store.uploads.get(uploadId);
  if (!upload) throw new Error("Upload not found or expired. Please upload the file again.");
  return upload;
}

export function runConversion(input: {
  uploadId: string;
  sheetName: string;
  mapping: ColumnMapping;
  header: POHeaderInput;
  persist: boolean;
  treatWarningsAsErrors?: boolean;
}) {
  const upload = requireUpload(input.uploadId);
  const conversionId = newId("CNV");

  logEvent(conversionId, "conversion", "Mapping applied", {
    message: `${Object.keys(input.mapping).length} mapped fields`,
  });

  const { rows } = readSheetRows(upload.base64, input.sheetName);
  logEvent(conversionId, "excel-reader", "Rows parsed", { message: `${rows.length} rows` });

  const palletRows = applyMapping(rows, input.mapping);
  logEvent(conversionId, "validation", "Validation started");

  const sequenceNumber = getNextSequenceNumber(input.header, store.conversions.size);
  const headerForGeneration = {
    ...input.header,
    sequenceNumber,
  };

  const result = generatePOFile({
    conversionId,
    header: headerForGeneration,
    rows: palletRows,
    treatWarningsAsErrors: input.treatWarningsAsErrors,
  });

  pushLogs(result.logs);
  logEvent(conversionId, "validation", "Validation completed", {
    message: `${result.errors.length} error(s), ${result.warnings.length} warning(s)`,
    level: result.errors.length ? "error" : "info",
  });

  const invalidRows = new Set(
    result.errors.filter((e) => e.excelRow !== undefined).map((e) => e.excelRow),
  ).size;

  const record: ConversionRecord = {
    id: conversionId,
    status: result.status,
    sourceFileName: upload.fileName,
    outputFileName: result.fileName,
    selectedSheet: input.sheetName,
    totalRows: palletRows.length,
    validRows: palletRows.length - invalidRows,
    invalidRows,
    warningCount: result.warnings.length,
    recordCount: result.recordCount,
    palletCount: result.palletCount,
    cartonCount: result.cartonCount,
    createdAt: new Date().toISOString(),
    completedAt: result.status === "Completed" ? new Date().toISOString() : null,
    content: result.content,
    errors: result.errors,
    warnings: result.warnings,
    header: input.header,
    mapping: input.mapping,
  };

  if (input.persist) {
    store.conversions.set(conversionId, record);
  }

  return {
    conversionId,
    status: result.status,
    fileName: result.fileName,
    recordCount: result.recordCount,
    palletCount: result.palletCount,
    cartonCount: result.cartonCount,
    totalRows: record.totalRows,
    validRows: record.validRows,
    invalidRows: record.invalidRows,
    errors: result.errors,
    warnings: result.warnings,
    recordLengths: result.recordLengths,
    logs: result.logs,
  };
}

export function requireConversion(id: string) {
  const conversion = store.conversions.get(id);
  if (!conversion) throw new Error("Conversion not found.");
  return conversion;
}

export function buildValidationReport(id: string) {
  const c = requireConversion(id);
  const line = (i: ValidationIssue) =>
    [
      i.severity.toUpperCase(),
      i.excelRow ?? "",
      i.recordType ?? "",
      i.field ?? "",
      i.code,
      i.fromPosition ? `${i.fromPosition}-${i.toPosition}` : "",
      i.value ?? "",
      i.message,
    ].join("\t");

  const body = [
    `Validation report`,
    `Conversion ID: ${c.id}`,
    `Source file: ${c.sourceFileName}`,
    `Output file: ${c.outputFileName}`,
    `Status: ${c.status}`,
    `Rows: ${c.totalRows} (valid ${c.validRows}, invalid ${c.invalidRows})`,
    `Records: ${c.recordCount}  Pallets: ${c.palletCount}  Cartons: ${c.cartonCount}`,
    "",
    ["SEVERITY", "EXCEL ROW", "RECORD", "FIELD", "CODE", "POSITIONS", "VALUE", "MESSAGE"].join("\t"),
    ...c.errors.map(line),
    ...c.warnings.map(line),
  ];
  return {
    fileName: `${c.outputFileName.replace(/\.[^.]+$/, "")}-validation.txt`,
    content: body.join("\r\n") + "\r\n",
  };
}
