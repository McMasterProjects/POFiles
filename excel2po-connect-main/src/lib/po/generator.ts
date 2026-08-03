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

export function getNextSequenceNumber(
  header: POHeaderInput,
  previousCount = 0,
): string {
  if (header.fileName?.trim()) {
    return String(header.sequenceNumber ?? "")
      .trim()
      .padStart(4, "0");
  }

  const baseSequence =
    String(header.sequenceNumber ?? "").trim() ||
    String(header.batchNumber ?? "").trim() ||
    "1";

  const parsed = Number.parseInt(baseSequence, 10);
  const next = Number.isNaN(parsed)
    ? 1
    : parsed + previousCount;

  return String(next).padStart(4, "0");
}

export function buildFileName(
  header: POHeaderInput,
  sequenceOverride?: string,
): string {
  if (header.fileName?.trim()) {
    return header.fileName.trim();
  }

  const seq = (
    sequenceOverride ??
    getNextSequenceNumber(header)
  ).padStart(4, "0");

  const prefix = "POMTS";

  const destination = String(
    header.destinationAddress || "000",
  )
    .trim()
    .padStart(3, "0");

  return `${prefix}${seq}.${destination}`;
}

/**
 * Creates a randomized list of sequence numbers.
 *
 * Example for five rows:
 * [1, 3, 5, 2, 4]
 *
 * Every number from 1 to the row count is included once.
 */
export function createRandomSequenceNumbers(
  count: number,
): number[] {
  const sequenceNumbers = Array.from(
    { length: count },
    (_, index) => index + 1,
  );

  for (
    let currentIndex = sequenceNumbers.length - 1;
    currentIndex > 0;
    currentIndex--
  ) {
    const randomIndex = Math.floor(
      Math.random() * (currentIndex + 1),
    );

    [
      sequenceNumbers[currentIndex],
      sequenceNumbers[randomIndex],
    ] = [
      sequenceNumbers[randomIndex],
      sequenceNumbers[currentIndex],
    ];
  }

  return sequenceNumbers;
}

/**
 * Returns the barcode used for grouping rows.
 *
 * SSCC is used first.
 * If the SSCC is blank, the pallet ID is used.
 * If both are blank, the row is treated as unique.
 */
function getBarcodeKey(
  row: PalletRow,
  index: number,
): string {
  const sscc = String(
    row.values.sscc ?? "",
  ).trim();

  const palletId = String(
    row.values.palletId ?? "",
  ).trim();

  return sscc || palletId || `__row__${index}`;
}

/**
 * Assigns sequence numbers to all rows.
 *
 * Repeated barcodes receive a randomized sequence containing
 * every number from 1 to the number of repeated rows.
 *
 * Unique barcodes always receive sequence 1.
 */
export function assignRandomSequenceNumbers(
  rows: PalletRow[],
): number[] {
  const barcodeGroups = new Map<
    string,
    number[]
  >();

  rows.forEach((row, index) => {
    const barcodeKey = getBarcodeKey(row, index);
    const existingIndexes =
      barcodeGroups.get(barcodeKey) ?? [];

    existingIndexes.push(index);
    barcodeGroups.set(
      barcodeKey,
      existingIndexes,
    );
  });

  const rowSequences = new Array<number>(
    rows.length,
  ).fill(1);

  for (const rowIndexes of barcodeGroups.values()) {
    if (rowIndexes.length === 1) {
      rowSequences[rowIndexes[0]] = 1;
      continue;
    }

    const randomizedSequences =
      createRandomSequenceNumbers(
        rowIndexes.length,
      );

    rowIndexes.forEach(
      (rowIndex, groupIndex) => {
        rowSequences[rowIndex] =
          randomizedSequences[groupIndex];
      },
    );
  }

  return rowSequences;
}

export function generatePOFile(input: {
  conversionId: string;
  header: POHeaderInput;
  rows: PalletRow[];
  treatWarningsAsErrors?: boolean;
}): GenerationResult {
  const {
    conversionId,
    header,
    rows,
  } = input;

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

  const cartonCount = rows.reduce(
    (sum, row) =>
      sum +
      (toNumber(row.values.cartons) ?? 0),
    0,
  );

  const palletCount = rows.length;
  const records: BuiltRecord[] = [];

  /*
   * Unique barcodes receive sequence 1.
   *
   * Repeated barcodes receive a randomized set of sequence
   * numbers from 1 to the number of repetitions.
   *
   * Example:
   * 1, 3, 5, 2, 4
   */
  const rowSequences =
    assignRandomSequenceNumbers(rows);

  records.push(buildBHRecord(ctx));
  log("BH generated");

  records.push(
    buildOHRecord(ctx, palletCount, Math.round(cartonCount)),
  );
  log("OH generated");

  records.push(buildOLRecord(ctx));
  log("OL generated");

  const includeOK = Boolean(
    ctx.header.containerNumber?.trim() ||
    ctx.header.sealNumber?.trim(),
  );

  if (includeOK) {
    records.push(
      buildOKRecord(ctx, palletCount),
    );
    log("OK generated");
  }

  records.push(
    buildOCRecord(
      ctx,
      palletCount,
      Math.round(cartonCount),
    ),
  );
  log("OC generated");

  rows.forEach((row, index) => {
    const sequenceNumber =
      rowSequences[index] ?? 1;

    records.push(
      buildOPRecord(
        ctx,
        row,
        sequenceNumber,
      ),
    );
  });

  log("OP records generated", {
    message: `${rows.length} OP records`,
  });

  const opCount = rows.length;
  const okCount = Number(includeOK);

  // BH + OH + OL + optional OK + OC + OP + BT rows
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

  const recordLengths = records.map(
    (record) => ({
      recordType: record.recordType,
      length: record.line.length,
      expected:
        RECORD_LENGTHS[record.recordType],
      ok:
        record.line.length ===
        RECORD_LENGTHS[record.recordType],
    }),
  );

  log("Record lengths validated");

  const issues: ValidationIssue[] =
    records.flatMap(
      (record) => record.errors,
    );

  recordLengths.forEach(
    (recordLength, index) => {
      if (!recordLength.ok) {
        issues.push({
          code: "INVALID_RECORD_LENGTH",
          severity: "error",
          message:
            `${recordLength.recordType} record ` +
            `must be exactly ` +
            `${recordLength.expected} characters.`,
          recordType:
            recordLength.recordType,
          excelRow:
            records[index].excelRow,
          expectedLength:
            recordLength.expected,
          actualLength:
            recordLength.length,
        });
      }
    },
  );

  const btCartons =
    Math.round(cartonCount);

  const opCartons = rows.reduce(
    (sum, row) =>
      sum +
      Math.round(
        toNumber(row.values.cartons) ?? 0,
      ),
    0,
  );

  if (btCartons !== opCartons) {
    issues.push({
      code: "TOTALS_DO_NOT_BALANCE",
      severity: "error",
      message:
        `Carton totals do not agree ` +
        `(OP ${opCartons} vs BT ${btCartons}).`,
      recordType: "BT",
    });
  }

  log("Totals validated", {
    message:
      `${opCartons} cartons, ` +
      `${palletCount} pallets`,
  });

  const errors = issues.filter(
    (issue) =>
      issue.severity === "error" ||
      Boolean(
        input.treatWarningsAsErrors &&
          issue.severity === "warning",
      ),
  );

  const warnings = issues.filter(
    (issue) =>
      issue.severity === "warning",
  );

  const content = joinWithCRLF(
    records.map((record) => record.line),
  );

  const fileName = buildFileName(header);

  log("Output file created", {
    message: fileName,
  });

  return {
    conversionId,
    status:
      errors.length > 0
        ? "Validation Failed"
        : "Completed",
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