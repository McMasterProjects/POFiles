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
    return String(header.sequenceNumber ?? "")
      .trim()
      .padStart(3, "0");
  }

  const baseSequence = String(header.sequenceNumber ?? "").trim();
  const parsedBase = Number.parseInt(baseSequence, 10);
  const start = Number.isNaN(parsedBase) ? 1 : Math.max(parsedBase, 1);
  const next = start + previousCount;
  const wrapped = ((next - 1) % 999) + 1;

  return String(wrapped).padStart(3, "0");
}

export function buildFileName(header: POHeaderInput, sequenceOverride?: string): string {
  if (header.fileName?.trim()) {
    return header.fileName.trim();
  }

  const seq = (sequenceOverride ?? getNextSequenceNumber(header)).padStart(3, "0");
  const destination = getDestinationSuffix(header);

  return `POMTS${seq}.${destination}`;
}

function getDestinationSuffix(header: POHeaderInput): string {
  return String(header.destinationAddress || "000")
    .trim()
    .slice(0, 3)
    .padEnd(3, "0");
}

export function createRandomSequenceNumbers(count: number): number[] {
  const sequenceNumbers = Array.from({ length: count }, (_, index) => index + 1);

  for (let currentIndex = sequenceNumbers.length - 1; currentIndex > 0; currentIndex--) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));

    [sequenceNumbers[currentIndex], sequenceNumbers[randomIndex]] = [
      sequenceNumbers[randomIndex],
      sequenceNumbers[currentIndex],
    ];
  }

  return sequenceNumbers;
}

function getBarcodeKey(row: PalletRow, index: number): string {
  const sscc = String(row.values.sscc ?? "").trim();

  const palletId = String(row.values.palletId ?? "").trim();

  return sscc || palletId || `__row__${index}`;
}

export function assignRandomSequenceNumbers(rows: PalletRow[]): number[] {
  const barcodeGroups = new Map<string, number[]>();

  rows.forEach((row, index) => {
    const barcodeKey = getBarcodeKey(row, index);
    const existingIndexes = barcodeGroups.get(barcodeKey) ?? [];

    existingIndexes.push(index);
    barcodeGroups.set(barcodeKey, existingIndexes);
  });

  const rowSequences = new Array<number>(rows.length).fill(1);

  for (const rowIndexes of barcodeGroups.values()) {
    if (rowIndexes.length === 1) {
      rowSequences[rowIndexes[0]] = 1;
      continue;
    }

    const randomizedSequences = createRandomSequenceNumbers(rowIndexes.length);

    rowIndexes.forEach((rowIndex, groupIndex) => {
      rowSequences[rowIndex] = randomizedSequences[groupIndex];
    });
  }

  return rowSequences;
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

  log("Record generation started", {
    message: `${rows.length} pallet rows`,
  });

  const ctx = makeContext(header);

  const cartonCount = rows.reduce((sum, row) => sum + (toNumber(row.values.cartons) ?? 0), 0);

  const palletCount = rows.length;
  const records: BuiltRecord[] = [];

  const rowSequences = assignRandomSequenceNumbers(rows);

  records.push(buildBHRecord(ctx));
  log("BH generated");

  records.push(buildOHRecord(ctx, palletCount, Math.round(cartonCount)));
  log("OH generated");

  records.push(buildOLRecord(ctx));
  log("OL generated");

  const includeOK = Boolean(ctx.header.containerNumber?.trim() || ctx.header.sealNumber?.trim());

  if (includeOK) {
    records.push(buildOKRecord(ctx, palletCount));
    log("OK generated");
  }

  records.push(buildOCRecord(ctx, palletCount, Math.round(cartonCount)));
  log("OC generated");

  rows.forEach((row, index) => {
    const sequenceNumber = rowSequences[index] ?? 1;

    records.push(buildOPRecord(ctx, row, sequenceNumber));
  });

  log("OP records generated", {
    message: `${rows.length} OP records`,
  });

  const opCount = rows.length;
  const okCount = Number(includeOK);

  const recordCount = 5 + okCount + opCount;

  records.push(
    buildBTRecord(ctx, {
      recordCount,
      oh: 1,
      ol: 1,
      oc: 1,
      ok: okCount,
      op: opCount,
      cartons: Math.round(cartonCount),
      pallets: palletCount,
    }),
  );

  log("BT generated", {
    message: `record count ${recordCount}`,
  });

  const recordLengths = records.map((record) => ({
    recordType: record.recordType,
    length: record.line.length,
    expected: RECORD_LENGTHS[record.recordType],
    ok: record.line.length === RECORD_LENGTHS[record.recordType],
  }));

  log("Record lengths validated");

  const issues: ValidationIssue[] = records.flatMap((record) => record.errors);

  recordLengths.forEach((recordLength, index) => {
    if (!recordLength.ok) {
      issues.push({
        code: "INVALID_RECORD_LENGTH",
        severity: "error",
        message:
          `${recordLength.recordType} record ` +
          `must be exactly ` +
          `${recordLength.expected} characters.`,
        recordType: recordLength.recordType,
        excelRow: records[index].excelRow,
        expectedLength: recordLength.expected,
        actualLength: recordLength.length,
      });
    }
  });

  const btCartons = Math.round(cartonCount);

  const opCartons = rows.reduce(
    (sum, row) => sum + Math.round(toNumber(row.values.cartons) ?? 0),
    0,
  );

  if (btCartons !== opCartons) {
    issues.push({
      code: "TOTALS_DO_NOT_BALANCE",
      severity: "error",
      message: `Carton totals do not agree ` + `(OP ${opCartons} vs BT ${btCartons}).`,
      recordType: "BT",
    });
  }

  log("Totals validated", {
    message: `${opCartons} cartons, ` + `${palletCount} pallets`,
  });

  const errors = issues.filter(
    (issue) =>
      issue.severity === "error" ||
      Boolean(input.treatWarningsAsErrors && issue.severity === "warning"),
  );

  const warnings = issues.filter((issue) => issue.severity === "warning");

  const content = joinWithCRLF(records.map((record) => record.line));

  const fileName = buildFileName(header);

  log("Output file created", {
    message: fileName,
  });

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
