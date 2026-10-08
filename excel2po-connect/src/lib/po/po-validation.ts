import { isValidSSCC } from "./format";
import { parsePOText, type ParsedPOFile } from "./po-parser";
import { PO_RECORD_LAYOUTS, isSupportedPORecordType } from "./po-record-layouts";

export interface POValidationIssue {
  code: string;
  severity: "error" | "warning";
  message: string;
  lineNumber?: number;
  recordType?: string;
  field?: string;
  fromPosition?: number;
  toPosition?: number;
  value?: string;
}

export interface POValidationResult {
  status: "Valid" | "Warning" | "Invalid";
  errors: POValidationIssue[];
  warnings: POValidationIssue[];
}

export function validatePO(parsed: ParsedPOFile): POValidationResult {
  const issues: POValidationIssue[] = [];
  const add = (issue: POValidationIssue) => issues.push(issue);

  if (!parsed.records.length) {
    add({
      code: "EMPTY_FILE",
      severity: "error",
      message: "The uploaded file contains no PO records.",
    });
  }

  parsed.records.forEach((record) => {
    if (!isSupportedPORecordType(record.recordType)) {
      add({
        code: "UNSUPPORTED_RECORD_TYPE",
        severity: "error",
        message: `Record type '${record.recordType || "blank"}' is not supported.`,
        lineNumber: record.lineNumber,
        recordType: record.recordType,
      });
      return;
    }

    const expectedLength = PO_RECORD_LAYOUTS[record.recordType].length;
    if (record.length !== expectedLength) {
      add({
        code: "INVALID_RECORD_LENGTH",
        severity: "error",
        message: `${record.recordType} record must be exactly ${expectedLength} characters (received ${record.length}).`,
        lineNumber: record.lineNumber,
        recordType: record.recordType,
      });
    }
  });

  if (!parsed.records.some((record) => record.recordType === "BH")) {
    add({ code: "MISSING_BH", severity: "error", message: "The PO file is missing a BH record." });
  }
  if (!parsed.records.some((record) => record.recordType === "BT")) {
    add({ code: "MISSING_BT", severity: "error", message: "The PO file is missing a BT record." });
  }
  if (!parsed.pallets.length) {
    add({
      code: "MISSING_OP",
      severity: "warning",
      message: "The PO file contains no OP pallet records.",
    });
  }
  if (parsed.lineEnding !== "CRLF") {
    add({
      code: "INVALID_LINE_ENDING",
      severity: "warning",
      message: `PO lines use ${parsed.lineEnding === "none" ? "no" : parsed.lineEnding} line endings; CRLF is recommended.`,
    });
  }

  parsed.pallets.forEach((pallet) => {
    if (pallet.sscc && !isValidSSCC(pallet.sscc)) {
      add({
        code: "INVALID_SSCC",
        severity: "error",
        message: "SSCC / Barcode must contain exactly 18 digits.",
        lineNumber: pallet.lineNumber,
        recordType: "OP",
        field: "sscc",
        fromPosition: 316,
        toPosition: 333,
        value: pallet.sscc,
      });
    }
  });

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    status: errors.length ? "Invalid" : warnings.length ? "Warning" : "Valid",
    errors,
    warnings,
  };
}

export function parseAndValidatePO(text: string): {
  parsed: ParsedPOFile;
  validation: POValidationResult;
} {
  const parsed = parsePOText(text);
  return { parsed, validation: validatePO(parsed) };
}
