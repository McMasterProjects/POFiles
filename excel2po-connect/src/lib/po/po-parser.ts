import { PALLET_FIELDS, type PalletFieldKey } from "./types";
import { isSupportedPORecordType, type SupportedPORecordType } from "./po-record-layouts";

export interface ParsedPORecord {
  lineNumber: number;
  recordType: string;
  raw: string;
  length: number;
}

export type ParsedPallet = {
  lineNumber: number;
  batchNumber: string;
  sequenceNumber: string;
} & Record<PalletFieldKey, string>;

export interface ParsedPOFile {
  records: ParsedPORecord[];
  pallets: ParsedPallet[];
  lineEnding: "CRLF" | "LF" | "CR" | "mixed" | "none";
  hasTrailingLineEnding: boolean;
}

function getLineEnding(text: string): ParsedPOFile["lineEnding"] {
  const endings = [...text.matchAll(/\r\n|\n|\r/g)].map((match) => match[0]);
  if (!endings.length) return "none";
  const unique = new Set(endings);
  if (unique.size > 1) return "mixed";
  return endings[0] === "\r\n" ? "CRLF" : endings[0] === "\n" ? "LF" : "CR";
}

export function getRecordType(line: string): string {
  return line.slice(0, 2).trim().toUpperCase();
}

export function parsePOText(text: string): ParsedPOFile {
  const lines = text.split(/\r\n|\n|\r/);
  const records: ParsedPORecord[] = [];
  const pallets: ParsedPallet[] = [];

  lines.forEach((raw, index) => {
    if (!raw.trim()) return;
    const recordType = getRecordType(raw);
    records.push({ lineNumber: index + 1, recordType, raw, length: raw.length });

    if (isSupportedPORecordType(recordType) && recordType === "OP") {
      pallets.push({
        lineNumber: index + 1,
        batchNumber: raw.slice(407 - 1, 426).trim(),
        sequenceNumber: raw.slice(22 - 1, 26).trim(),
        ...Object.fromEntries(
          PALLET_FIELDS.map((field) => [field.key, raw.slice(field.from - 1, field.to).trim()]),
        ),
      } as ParsedPallet);
    }
  });

  return {
    records,
    pallets,
    lineEnding: getLineEnding(text),
    hasTrailingLineEnding: /(?:\r\n|\n|\r)$/.test(text),
  };
}

export function isPORecordType(value: string): value is SupportedPORecordType {
  return isSupportedPORecordType(value);
}