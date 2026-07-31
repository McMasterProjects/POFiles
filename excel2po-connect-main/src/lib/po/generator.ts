import {
  RECORD_LENGTHS,
  buildBHRecord,
  buildBTRecord,
  buildOCRecord,
  buildOHRecord,
  buildOKRecord,
  buildOLRecord,
  buildOPRecord,
  makeContext,
  type BuiltRecord,
} from "./builders";
import { toNumber } from "./format";
import type {
  GenerationResult,
  LogEntry,
  PalletRow,
  POHeaderInput,
  ValidationIssue,
} from "./types";

export const CRLF = "\r\n";

export function joinWithCRLF(lines: string[]): string {
  return lines.join(CRLF) + CRLF;
}

export function getNextSequenceNumber(header: POHeaderInput, previousCount = 0): string {
  if (header.fileName?.trim()) {
    return String(header.sequenceNumber ?? "").trim().padStart(4, "0");
  }

  const baseSequence = String(header.sequenceNumber ?? "").trim() || String(header.batchNumber ?? "").trim() || "1";
  const parsed = Number.parseInt(baseSequence, 10);
  const next = Number.isNaN(parsed) ? 1 : parsed + previousCount;
  return String(next).padStart(4, "0");
}

export function buildFileName(header: POHeaderInput, sequenceOverride?: string): string {
  if (header.fileName?.trim()) return header.fileName.trim();

  const seq = (sequenceOverride ?? getNextSequenceNumber(header)).padStart(4, "0");
  const prefix = "POMTS";
  const destination = String(header.destinationAddress || "000").trim().padStart(3, "0");
  return `${prefix}${seq}.${destination}`;
}

export function generatePOFile(input: {
  conversionId: string;
  header: POHeaderInput;
  rows: PalletRow[];
  treatWarningsAsErrors?: boolean;
}): GenerationResult {
  const { conversionId, header, rows } = input;
  const logs: LogEntry[] = [];
  const log = (
    action: string,
    extra: Partial<LogEntry> = {},
    level: LogEntry["level"] = "info",
  ) => {
    logs.push({
      timestamp: new Date().toISOString(),
      level,
      conversionId,
      module: "po-generator",
      action,
      ...extra,
    });
  };

  log("Record generation started", { message: `${rows.length} pallet rows` });

  const ctx = makeContext(header);
  const cartonCount = rows.reduce((sum, r) => sum + (toNumber(r.values.cartons) ?? 0), 0);
  const palletCount = rows.length;

  const records: BuiltRecord[] = [];
  const barcodeSequenceCounts = new Map<string, number>();

  const getBarcodeKey = (row: PalletRow, index: number) => {
    const rawBarcode = String(row.values.sscc || row.values.palletId || "").trim();
    return rawBarcode || `__row__${index}`;
  };

  const rowSequences = rows.map((row, index) => {
    const barcodeKey = getBarcodeKey(row, index);
    const nextSequence = (barcodeSequenceCounts.get(barcodeKey) ?? 0) + 1;
    barcodeSequenceCounts.set(barcodeKey, nextSequence);
    return nextSequence;
  });

  records.push(buildBHRecord(ctx));
  log("BH generated");
  records.push(buildOHRecord(ctx, palletCount));
  log("OH generated");
  records.push(buildOLRecord(ctx));
  log("OL generated");
  records.push(buildOKRecord(ctx, palletCount));
  log("OK generated");
  records.push(buildOCRecord(ctx, palletCount, Math.round(cartonCount)));
  log("OC generated");

  rows.forEach((row, index) => {
    records.push(buildOPRecord(ctx, row, rowSequences[index]));
  });
  log("OP records generated", { message: `${rows.length} OP records` });

  const opCount = rows.length;
  const recordCount = 6 + opCount; // BH + OH + OL + OK + OC + BT + OP rows
  records.push(
    buildBTRecord(ctx, {
      recordCount,
      oh: 1,
      ol: 1,
      oc: 1,
      ok: 1,
      op: opCount,
      cartons: Math.round(cartonCount),
      pallets: palletCount,
    }),
  );
  log("BT generated", { message: `record count ${recordCount}` });

  // Record length verification
  const recordLengths = records.map((r) => ({
    recordType: r.recordType,
    length: r.line.length,
    expected: RECORD_LENGTHS[r.recordType],
    ok: r.line.length === RECORD_LENGTHS[r.recordType],
  }));
  log("Record lengths validated");

  const issues: ValidationIssue[] = records.flatMap((r) => r.errors);

  recordLengths.forEach((r, index) => {
    if (!r.ok) {
      issues.push({
        code: "INVALID_RECORD_LENGTH",
        severity: "error",
        message: `${r.recordType} record must be exactly ${r.expected} characters.`,
        recordType: r.recordType,
        excelRow: records[index].excelRow,
        expectedLength: r.expected,
        actualLength: r.length,
      });
    }
  });

  // Totals cross-check between OK / OC / BT
  const btCartons = Math.round(cartonCount);
  const opCartons = rows.reduce((s, r) => s + Math.round(toNumber(r.values.cartons) ?? 0), 0);
  if (btCartons !== opCartons) {
    issues.push({
      code: "TOTALS_DO_NOT_BALANCE",
      severity: "error",
      message: `Carton totals do not agree (OP ${opCartons} vs BT ${btCartons}).`,
      recordType: "BT",
    });
  }
  log("Totals validated", { message: `${opCartons} cartons, ${palletCount} pallets` });

  const errors = issues.filter(
    (i) => i.severity === "error" || (input.treatWarningsAsErrors && i.severity === "warning"),
  );
  const warnings = issues.filter((i) => i.severity === "warning");

  const content = joinWithCRLF(records.map((r) => r.line));
  const fileName = buildFileName(header);
  log("Output file created", { message: fileName });

  return {
    conversionId,
    status: errors.length > 0 ? "Validation Failed" : "Completed",
    fileName,
    content,
    recordCount,
    palletCount,
    cartonCount: opCartons,
    errors,
    warnings,
    logs,
    recordLengths,
  };
}
