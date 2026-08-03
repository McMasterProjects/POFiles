import { RecordWriter, type FixedWidthError } from "./fixed-width";
import {
  formatDecimal,
  formatInteger,
  formatPODate,
  formatPODateTime,
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
  batchNumber: string;
  fileSequence: string;
  transactionDate: string;
  transactionTime: string;
}

export function makeContext(header: POHeaderInput): Ctx {
  const now = new Date();
  const sequenceSource = header.sequenceNumber?.trim() || header.batchNumber?.trim() || "1";
  const sequenceValue = Number.parseInt(sequenceSource, 10);
  const fileSequence = String(Number.isNaN(sequenceValue) ? 1 : sequenceValue).padStart(3, "0");
  const batchNumber = String(Number.isNaN(sequenceValue) ? 1 : sequenceValue).padStart(6, "0");
  const fromDepot = (header.sourceAddress?.trim() || "000").slice(0, 3);
  const loadId = (header.loadId?.trim() || `${fromDepot}-${batchNumber}`).slice(0, 10);
  return {
    header,
    loadId,
    batchNumber,
    fileSequence,
    transactionDate: header.transactionDate?.trim() || formatPODate(now)!,
    transactionTime: header.transactionTime?.trim() || formatPOTime(now),
  };
}

export function buildBHRecord(ctx: Ctx): BuiltRecord {
  const h = ctx.header;
  const w = new RecordWriter(RECORD_LENGTHS.BH, "BH");
  w.put(1, 2, "BH", { field: "recordType" });
  w.put(3, 5, (h.sourceAddress || "000").trim().slice(0, 3), { field: "sourceAddress" });
  w.num(6, 11, ctx.batchNumber, { field: "batchNumber" });
  w.put(12, 19, ctx.transactionDate, { field: "transactionDate" });
  w.put(20, 27, `${ctx.transactionTime}:00`, { field: "transactionTime" });
  w.put(28, 29, "", { field: "indicator" });
  w.put(30, 59, (h.provider || "Paltrack").trim(), { field: "provider", allowTruncate: true });
  w.put(60, 89, (h.version || "2.18").trim(), { field: "version", allowTruncate: true });
  const { line, errors } = w.done();
  return { recordType: "BH", line, errors };
}

export function buildOHRecord(ctx: Ctx, palletCount: number, cartonCount: number): BuiltRecord {
  const h = ctx.header;
  const w = new RecordWriter(RECORD_LENGTHS.OH, "OH");
  w.put(1, 2, "OH", { field: "recordType" });
  w.put(3, 12, ctx.loadId, { field: "loadId" });
  w.put(13, 22, h.loadReference?.trim() || ctx.loadId, { field: "loadReference" });
  w.put(23, 47, h.loadReference?.trim() || ctx.loadId, { field: "loadName" });
  w.put(48, 48, "R", { field: "transportMode" });
  // Per spec: transport (R), load_type (F=flat-bed or R=reefer), load_status (P planning, etc.)
  w.put(49, 49, h.loadType || "F", { field: "loadType" });
  w.put(50, 50, h.loadStatus || "P", { field: "loadStatus" });
  w.num(134, 138, formatInteger(palletCount, 5), { field: "palletCount" });
  w.num(139, 146, formatInteger(cartonCount, 8), { field: "cartonCount" });
  w.put(159, 160, h.destinationType || "DP", { field: "destinationType" });
  w.put(161, 167, h.locationCode, { field: "locationCode" });
  w.put(190, 196, h.locationCode, { field: "locationCode" });
  w.put(197, 200, ctx.transactionDate.slice(0, 4), { field: "season" });
  w.put(
    207,
    214,
    `${(h.sourceAddress || "000").trim().slice(0, 3)}${ctx.fileSequence}`.slice(0, 8),
    { field: "tripNo" },
  );
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

export function buildOCRecord(ctx: Ctx, palletCount: number, cartonCount: number): BuiltRecord {
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

export function buildOPRecord(ctx: Ctx, row: PalletRow, sequence: number): BuiltRecord {
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
  w.put(76, 77, codeOrError(w, "country", v.country, 2, 76, 77, "country", row.excelRow), {
    field: "country",
  });
  w.put(78, 79, get("commGrp"), { field: "commGrp" });
  w.put(80, 81, get("commodity"), { field: "commodity" });
  w.put(82, 83, get("varGrp"), { field: "varGrp" });
  w.put(84, 86, get("variety"), { field: "variety" });
  w.put(87, 89, get("subVar"), { field: "subVar" });
  w.put(90, 92, get("actVar"), { field: "actVar" });
  w.put(93, 96, get("pack"), { field: "pack" });
  w.put(97, 100, get("grade"), { field: "grade" });
  w.put(101, 105, get("mark"), { field: "mark" });
  w.put(106, 110, get("sizeCount"), { field: "sizeCount" });
  w.put(111, 112, get("inventoryCode"), { field: "inventoryCode" });
  w.put(113, 116, get("pickRef"), { field: "pickRef" });
  w.put(117, 123, get("farm"), { field: "farm" });
  w.put(124, 125, get("prodGrp"), { field: "prodGrp" });
  w.put(126, 128, get("prodChar"), { field: "prodChar" });
  w.put(129, 130, get("targetMarket"), { field: "targetMarket" });
  w.num(131, 135, formatInteger(v.cartons, 5), { field: "cartons" });
  w.num(136, 144, formatInteger(v.palletQuantity ?? 1, 9), { field: "palletQuantity" });
  w.put(145, 145, "N", { field: "mixedIndicator" });
  w.put(146, 153, get("remarks"), { field: "remarks" });
  w.put(154, 157, get("reason"), { field: "reason" });

  const intake = dateOrError(w, v.originalIntakeDate, "originalIntakeDate", 173, 180, row.excelRow);
  w.put(158, 165, intake, { field: "intakeDate" });
  w.put(166, 172, h.locationCode, { field: "originalDepot" });
  w.put(173, 180, intake, { field: "originalIntakeDate" });
  w.put(181, 181, get("shift"), { field: "shift" });
  w.put(182, 189, dateOrError(w, v.shiftDate, "shiftDate", 182, 189, row.excelRow), {
    field: "shiftDate",
  });
  w.put(190, 195, "", { field: "orderNo" });
  w.put(196, 202, h.locationCode, { field: "locationCode" });
  w.put(203, 204, get("store"), { field: "store" });
  w.put(205, 206, get("stockPool"), { field: "stockPool" });
  w.put(207, 219, dateTimeOrError(w, v.shippedDate, "shippedDate", 207, 219, row.excelRow), {
    field: "shippedDate",
  });
  w.put(220, 220, "Y", { field: "transmitFlag" });
  w.num(221, 225, formatInteger(1, 5), { field: "revision" });
  w.put(241, 248, ctx.transactionDate, { field: "transactionDate" });
  w.put(249, 253, ctx.transactionTime, { field: "transactionTime" });
  w.put(254, 254, "S", { field: "palletBinType" });
  w.put(255, 264, get("origCons"), { field: "origCons" });
  w.put(265, 270, get("shipNumber"), { field: "shipNumber" });
  w.put(
    271,
    276,
    v.temperature === null || v.temperature === undefined || String(v.temperature).trim() === ""
      ? ""
      : formatDecimal(v.temperature, 6, 2),
    { field: "temperature" },
  );
  w.put(277, 285, get("comboPalletId"), { field: "comboPalletId" });
  w.put(286, 305, get("tempDeviceId"), { field: "tempDeviceId" });
  w.put(306, 307, get("tempDeviceType"), { field: "tempDeviceType" });
  w.put(308, 313, get("boeNo"), { field: "boeNo" });
  w.put(314, 315, get("principal"), { field: "principal" });

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

  w.num(334, 342, formatDecimal(v.nettMass, 9, 3), { field: "nettMass" });
  w.put(343, 358, get("saftbin1"), { field: "saftbin1" });
  w.put(359, 374, get("saftbin2"), { field: "saftbin2" });
  w.put(375, 390, get("saftbin3"), { field: "saftbin3" });
  w.put(391, 396, get("origAccount"), { field: "origAccount" });
  w.put(397, 404, dateOrError(w, v.inspectionDate, "inspectionDate", 397, 404, row.excelRow), {
    field: "inspectionDate",
  });
  w.put(405, 405, get("stackVariance"), { field: "stackVariance" });
  w.put(406, 406, get("storeType"), { field: "storeType" });
  w.put(407, 426, get("batchNo"), { field: "batchNo" });
  w.put(427, 436, get("waybillNo"), { field: "waybillNo" });
  w.put(437, 450, get("gtin"), { field: "gtin" });
  w.put(451, 457, get("packhouseCode"), { field: "packhouseCode" });
  w.put(458, 459, get("steriFlag"), { field: "steriFlag" });
  w.put(460, 461, get("steriDest"), { field: "steriDest" });
  w.put(462, 462, get("labelType"), { field: "labelType" });
  w.put(463, 463, get("provFlag"), { field: "provFlag" });
  w.put(464, 473, get("sellbyCode"), { field: "sellbyCode" });
  w.put(474, 491, get("comboSscc"), { field: "comboSscc" });
  w.put(492, 497, get("inspector"), { field: "inspector" });
  w.put(498, 503, get("inspectionPoint"), { field: "inspectionPoint" });
  w.put(504, 513, get("expiryCode"), { field: "expiryCode" });
  w.put(514, 528, get("orchard"), { field: "orchard", allowTruncate: true });
  w.put(529, 533, get("targetRegion"), { field: "targetRegion" });
  w.put(
    534,
    535,
    codeOrError(w, "country", v.targetCountry, 2, 534, 535, "targetCountry", row.excelRow),
    { field: "targetCountry" },
  );
  w.put(536, 555, get("globalGapNumber"), { field: "globalGapNumber" });
  w.put(556, 575, get("lotNo"), { field: "lotNo" });
  w.put(576, 595, get("traceabilityCode"), { field: "traceabilityCode" });
  w.put(596, 599, get("season"), { field: "season" });
  w.put(
    600,
    607,
    dateOrError(w, v.origInspectionDate, "origInspectionDate", 600, 607, row.excelRow),
    { field: "originalInspectionDate" },
  );
  w.put(608, 617, get("innerPack"), { field: "innerPack" });
  w.put(
    618,
    622,
    v.innerCartons === null || v.innerCartons === undefined || String(v.innerCartons).trim() === ""
      ? ""
      : formatInteger(v.innerCartons, 5),
    { field: "innerCartons" },
  );
  w.put(623, 642, get("productionId"), { field: "productionId" });
  w.put(643, 644, get("protocolExceptionIndicator"), { field: "protocolExceptionIndicator" });
  w.put(645, 669, get("upn"), { field: "upn", allowTruncate: true });
  w.put(670, 699, get("palletTreatment"), { field: "palletTreatment", allowTruncate: true });
  // Per spec: pallet_gross_mass is carried only on the first sequence of a pallet
  if (sequence === 1) {
    w.num(700, 709, formatDecimal(v.grossMass, 10, 3), { field: "palletGrossMass" });
  } else {
    w.put(700, 709, "", { field: "palletGrossMass" });
  }
  w.put(710, 719, get("samsaAccreditation"), { field: "samsaAccreditation" });
  w.put(720, 726, get("weighingLocation"), { field: "weighingLocation" });
  w.put(
    727,
    739,
    dateTimeOrError(w, v.weighingDateTime, "weighingDateTime", 727, 739, row.excelRow),
    { field: "weighingDateTime" },
  );
  w.put(740, 741, get("mainArea"), { field: "mainArea" });
  w.put(742, 757, get("productionArea"), { field: "productionArea", allowTruncate: true });
  w.put(758, 767, get("phytoData"), { field: "phytoData", allowTruncate: true });
  w.put(768, 807, get("custOrd"), { field: "custOrd", allowTruncate: true });
  w.put(808, 817, get("reInspectionDocument"), { field: "reInspectionDocument" });
  w.put(818, 827, get("eLotKey"), { field: "eLotKey" });
  w.put(828, 837, get("agreementCode"), { field: "agreementCode" });
  w.put(838, 977, get("postTreatment"), { field: "postTreatment", allowTruncate: true });
  w.put(978, 997, get("referenceNumber"), { field: "referenceNumber" });
  w.put(998, 1012, get("eLotKey"), { field: "eLotKey" });

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

function dateTimeOrError(
  w: RecordWriter,
  raw: unknown,
  field: string,
  from: number,
  to: number,
  excelRow?: number,
): string {
  if (raw === null || raw === undefined || String(raw).trim() === "") return "";
  const formatted = formatPODateTime(raw);
  if (!formatted) {
    return "";
  }
  return formatted;
}
