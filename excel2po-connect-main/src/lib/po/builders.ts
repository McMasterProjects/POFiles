import { RecordWriter, type FixedWidthError } from "./fixed-width";
import {
  formatDecimal,
  formatInteger,
  formatPODate,
  formatPOTime,
  isValidSSCC,
  toNumber,
  toPlainText,
} from "./format";
import { lookupCode } from "./code-tables";
import type { PalletRow, POHeaderInput } from "./types";

export const RECORD_LENGTHS = {
  BH: 89,
  OH: 309,
  OL: 100,
  OK: 370,
  OC: 220,
  OP: 1012,
  BT: 60,
} as const;

export type RecordType = keyof typeof RECORD_LENGTHS;

export interface BuiltRecord {
  recordType: RecordType;
  line: string;
  errors: FixedWidthError[];
  excelRow?: number;
}

interface Ctx {
  header: POHeaderInput;
  loadId: string;
  transactionDate: string;
  transactionTime: string;
}

export function makeContext(header: POHeaderInput): Ctx {
  const now = new Date();
  const loadId =
    (header.loadId?.trim() ||
      `${header.sourceAddress}-${String(header.batchNumber).padStart(6, "0")}`).slice(0, 10);
  return {
    header,
    loadId,
    transactionDate: header.transactionDate?.trim() || formatPODate(now)!,
    transactionTime: header.transactionTime?.trim() || formatPOTime(now),
  };
}

export function buildBHRecord(ctx: Ctx): BuiltRecord {
  const h = ctx.header;
  const w = new RecordWriter(RECORD_LENGTHS.BH, "BH");
  w.put(1, 2, "BH", { field: "recordType" });
  w.put(3, 5, h.sourceAddress, { field: "sourceAddress" });
  w.num(6, 11, formatInteger(h.batchNumber, 6), { field: "batchNumber" });
  w.put(12, 19, ctx.transactionDate, { field: "transactionDate" });
  w.put(20, 27, `${ctx.transactionTime}:00`, { field: "transactionTime" });
  w.put(28, 29, "PO", { field: "messageType" });
  w.put(30, 59, h.provider, { field: "provider", allowTruncate: true });
  w.put(60, 89, h.version, { field: "version", allowTruncate: true });
  const { line, errors } = w.done();
  return { recordType: "BH", line, errors };
}

export function buildOHRecord(ctx: Ctx, palletCount: number): BuiltRecord {
  const h = ctx.header;
  const w = new RecordWriter(RECORD_LENGTHS.OH, "OH");
  w.put(1, 2, "OH", { field: "recordType" });
  w.put(3, 12, ctx.loadId, { field: "loadId" });
  w.put(13, 22, h.loadReference?.trim() || ctx.loadId, { field: "loadReference" });
  w.put(48, 48, "R", { field: "transportMode" });
  w.put(49, 49, "R", { field: "transportType" });
  w.put(50, 50, "D", { field: "loadType" });
  w.num(134, 138, formatInteger(palletCount, 5), { field: "palletCount" });
  w.put(159, 160, h.destinationType || "DP", { field: "destinationType" });
  w.put(161, 167, h.locationCode, { field: "locationCode" });
  w.put(190, 196, h.locationCode, { field: "locationCode" });
  w.put(197, 200, ctx.transactionDate.slice(0, 4), { field: "season" });
  w.put(215, 215, "Y", { field: "transmitFlag" });
  w.num(216, 220, formatInteger(1, 5), { field: "revision" });
  const { line, errors } = w.done();
  return { recordType: "OH", line, errors };
}

export function buildOLRecord(ctx: Ctx): BuiltRecord {
  const h = ctx.header;
  const w = new RecordWriter(RECORD_LENGTHS.OL, "OL");
  w.put(1, 2, "OL", { field: "recordType" });
  w.put(3, 12, ctx.loadId, { field: "loadId" });
  w.put(13, 14, h.destinationType || "DP", { field: "destinationType" });
  w.put(15, 21, h.locationCode, { field: "locationCode" });
  w.num(22, 26, formatInteger(1, 5), { field: "sequence" });
  w.put(27, 27, "L", { field: "locationType" });
  w.put(67, 67, "Y", { field: "transmitFlag" });
  w.num(68, 72, formatInteger(1, 5), { field: "revision" });
  const { line, errors } = w.done();
  return { recordType: "OL", line, errors };
}

export function buildOKRecord(ctx: Ctx, palletCount: number): BuiltRecord {
  const h = ctx.header;
  const w = new RecordWriter(RECORD_LENGTHS.OK, "OK");
  w.put(1, 2, "OK", { field: "recordType" });
  w.put(3, 12, ctx.loadId, { field: "loadId" });
  w.put(13, 19, h.locationCode, { field: "locationCode" });
  w.put(20, 30, h.containerNumber, { field: "containerNumber" });
  w.put(31, 38, h.sealNumber, { field: "sealNumber" });
  w.put(113, 119, h.locationCode, { field: "locationCode" });
  w.num(125, 129, formatInteger(palletCount, 5), { field: "palletCount" });
  w.put(159, 159, "T", { field: "containerType" });
  w.put(160, 160, "Y", { field: "transmitFlag" });
  w.num(161, 165, formatInteger(1, 5), { field: "revision" });
  w.put(200, 200, "S", { field: "sealType" });
  w.put(226, 240, h.sealNumber, { field: "sealNumber" });
  const { line, errors } = w.done();
  return { recordType: "OK", line, errors };
}

export function buildOCRecord(
  ctx: Ctx,
  palletCount: number,
  cartonCount: number,
): BuiltRecord {
  const h = ctx.header;
  const w = new RecordWriter(RECORD_LENGTHS.OC, "OC");
  w.put(1, 2, "OC", { field: "recordType" });
  w.put(3, 12, ctx.loadId, { field: "loadId" });
  w.put(13, 19, h.locationCode, { field: "locationCode" });
  w.put(20, 21, h.organisationCode, { field: "organisationCode" });
  w.put(22, 31, h.consignmentNumber, { field: "consignmentNumber" });
  w.put(32, 33, "OT", { field: "consignmentType" });
  w.put(34, 41, h.stuffingDate?.trim() || ctx.transactionDate, { field: "stuffingDate" });
  w.put(48, 48, h.channel || "E", { field: "channel" });
  w.num(63, 70, formatInteger(cartonCount, 8), { field: "cartonCount" });
  w.num(71, 75, formatInteger(palletCount, 5), { field: "palletCount" });
  w.put(86, 89, ctx.transactionDate.slice(0, 4), { field: "season" });
  w.put(162, 162, "P", { field: "unitType" });
  w.put(168, 168, "Y", { field: "transmitFlag" });
  w.num(169, 173, formatInteger(1, 5), { field: "revision" });
  const { line, errors } = w.done();
  return { recordType: "OC", line, errors };
}

export function buildOPRecord(
  ctx: Ctx,
  row: PalletRow,
  sequence: number,
): BuiltRecord {
  const h = ctx.header;
  const v = row.values;
  const w = new RecordWriter(RECORD_LENGTHS.OP, "OP", row.excelRow);
  const get = (key: keyof typeof v) => toPlainText(v[key]);

  const palletId = get("palletId");
  const ssccRaw = get("sscc") || (palletId.length === 18 ? palletId : "");

  w.put(1, 2, "OP", { field: "recordType" });
  w.put(3, 12, ctx.loadId, { field: "loadId" });
  w.put(13, 21, ssccRaw ? "" : palletId, { field: "palletId" });
  w.num(22, 26, formatInteger(sequence, 5), { field: "sequenceNumber" });
  w.put(27, 27, "P", { field: "unitType" });
  w.put(42, 43, h.destinationType || "PO", { field: "destinationType" });
  w.put(44, 50, h.destinationLocation || h.locationCode, { field: "destinationLocation" });
  w.put(51, 60, h.consignmentNumber, { field: "consignmentNumber" });
  w.put(61, 71, h.containerNumber, { field: "containerNumber" });
  w.put(72, 72, "N", { field: "containerSplit" });
  w.put(73, 73, h.channel || "E", { field: "channel" });
  w.put(74, 75, h.organisationCode, { field: "organisation" });
  w.put(76, 77, codeOrError(w, "country", v.country, 2, 76, 77, "country", row.excelRow), { field: "country" });
  w.put(80, 81, get("commodity"), { field: "commodity" });
  w.put(84, 86, get("variety"), { field: "variety" });
  w.put(93, 96, get("pack"), { field: "pack" });
  w.put(97, 100, get("grade"), { field: "grade" });
  w.put(101, 105, get("mark"), { field: "mark" });
  w.put(106, 110, get("sizeCount"), { field: "sizeCount" });
  w.put(111, 112, get("inventoryCode"), { field: "inventoryCode" });
  w.put(117, 123, get("farm"), { field: "farm" });
  w.put(129, 130, get("targetMarket"), { field: "targetMarket" });
  w.num(131, 135, formatInteger(v.cartons, 5), { field: "cartons" });
  w.num(136, 144, formatInteger(v.palletQuantity ?? 1, 9), { field: "palletQuantity" });
  w.put(145, 145, "N", { field: "mixedIndicator" });

  const intake = dateOrError(w, v.originalIntakeDate, "originalIntakeDate", 173, 180, row.excelRow);
  w.put(158, 165, intake, { field: "intakeDate" });
  w.put(166, 172, h.locationCode, { field: "originalDepot" });
  w.put(173, 180, intake, { field: "originalIntakeDate" });
  w.put(196, 202, h.locationCode, { field: "locationCode" });
  w.put(220, 220, "Y", { field: "transmitFlag" });
  w.num(221, 225, formatInteger(1, 5), { field: "revision" });
  w.put(241, 248, ctx.transactionDate, { field: "transactionDate" });
  w.put(249, 253, ctx.transactionTime, { field: "transactionTime" });
  w.put(254, 254, "S", { field: "palletBinType" });

  if (ssccRaw) {
    if (!isValidSSCC(ssccRaw)) {
      w.errors.push({
        code: "INVALID_SSCC",
        severity: "error",
        message: "SSCC must contain exactly 18 digits.",
        recordType: "OP",
        excelRow: row.excelRow,
        field: "sscc",
        fromPosition: 316,
        toPosition: 333,
        expectedLength: 18,
        actualLength: ssccRaw.length,
        value: ssccRaw,
      });
    }
    w.put(316, 333, ssccRaw, { field: "sscc" });
  } else {
    w.errors.push({
      code: "SSCC_BLANK",
      severity: "warning",
      message: "SSCC is blank; only a 9-character pallet ID was supplied.",
      recordType: "OP",
      excelRow: row.excelRow,
      field: "sscc",
      fromPosition: 316,
      toPosition: 333,
      value: palletId,
    });
  }

  w.num(334, 342, formatDecimal(v.nettMass, 9, 2), { field: "nettMass" });
  w.put(397, 404, dateOrError(w, v.inspectionDate, "inspectionDate", 397, 404, row.excelRow), { field: "inspectionDate" });
  w.put(451, 457, get("packhouseCode"), { field: "packhouseCode" });
  w.put(492, 497, get("inspector"), { field: "inspector" });
  w.put(498, 503, get("inspectionPoint"), { field: "inspectionPoint" });
  w.put(514, 528, get("orchard"), { field: "orchard", allowTruncate: true });
  w.put(534, 535, codeOrError(w, "country", v.targetCountry, 2, 534, 535, "targetCountry", row.excelRow), { field: "targetCountry" });
  w.put(596, 599, get("season"), { field: "season" });
  w.put(600, 607, intake, { field: "originalInspectionDate" });
  w.put(645, 669, get("upn"), { field: "upn", allowTruncate: true });
  w.num(700, 709, formatDecimal(v.grossMass, 10, 3), { field: "palletGrossMass" });
  w.put(742, 757, get("productionArea"), { field: "productionArea", allowTruncate: true });
  w.put(758, 767, get("phytoData"), { field: "phytoData", allowTruncate: true });

  if (!palletId && !ssccRaw) {
    w.errors.push({
      code: "MISSING_REQUIRED_FIELD",
      severity: "error",
      message: "Pallet ID / barcode is required.",
      recordType: "OP",
      excelRow: row.excelRow,
      field: "palletId",
      fromPosition: 13,
      toPosition: 21,
    });
  }
  if (toNumber(v.cartons) === null) {
    w.errors.push({
      code: "INVALID_NUMBER",
      severity: "error",
      message: "Carton quantity is missing or not numeric.",
      recordType: "OP",
      excelRow: row.excelRow,
      field: "cartons",
      fromPosition: 131,
      toPosition: 135,
      value: toPlainText(v.cartons),
    });
  }

  const { line, errors } = w.done();
  return { recordType: "OP", line, errors, excelRow: row.excelRow };
}

export function buildBTRecord(
  ctx: Ctx,
  counts: {
    recordCount: number;
    oh: number;
    ol: number;
    oc: number;
    ok: number;
    op: number;
    cartons: number;
    pallets: number;
  },
): BuiltRecord {
  const h = ctx.header;
  const w = new RecordWriter(RECORD_LENGTHS.BT, "BT");
  w.put(1, 2, "BT", { field: "recordType" });
  w.put(3, 5, h.sourceAddress, { field: "sourceAddress" });
  w.num(6, 11, formatInteger(h.batchNumber, 6), { field: "batchNumber" });
  w.num(12, 18, formatInteger(counts.recordCount, 7), { field: "recordCount" });
  w.num(19, 23, formatInteger(counts.oh, 5), { field: "ohCount" });
  w.num(24, 28, formatInteger(counts.ol, 5), { field: "olCount" });
  w.num(29, 33, formatInteger(counts.oc, 5), { field: "ocCount" });
  w.num(34, 38, formatInteger(counts.ok, 5), { field: "okCount" });
  w.num(39, 43, formatInteger(counts.op, 5), { field: "opCount" });
  w.num(44, 51, formatInteger(counts.cartons, 8), { field: "cartonCount" });
  w.num(52, 60, formatInteger(counts.pallets, 9), { field: "palletCount" });
  const { line, errors } = w.done();
  return { recordType: "BT", line, errors };
}

function codeOrError(
  w: RecordWriter,
  table: string,
  raw: unknown,
  maxLength: number,
  from: number,
  to: number,
  field: string,
  excelRow?: number,
): string {
  const { value, unknown } = lookupCode(table, raw, maxLength);
  if (unknown) {
    w.errors.push({
      code: "UNKNOWN_CODE",
      severity: "error",
      message: `No code translation exists for "${String(raw)}".`,
      recordType: "OP",
      excelRow,
      field,
      fromPosition: from,
      toPosition: to,
      expectedLength: maxLength,
      value: String(raw ?? ""),
    });
  }
  return value;
}

function dateOrError(
  w: RecordWriter,
  raw: unknown,
  field: string,
  from: number,
  to: number,
  excelRow?: number,
): string {
  if (raw === null || raw === undefined || String(raw).trim() === "") return "";
  const formatted = formatPODate(raw);
  if (!formatted) {
    w.errors.push({
      code: "INVALID_DATE",
      severity: "error",
      message: `"${String(raw)}" is not a valid date (expected yyyymmdd).`,
      recordType: "OP",
      excelRow,
      field,
      fromPosition: from,
      toPosition: to,
      value: String(raw),
    });
    return "";
  }
  return formatted;
}
