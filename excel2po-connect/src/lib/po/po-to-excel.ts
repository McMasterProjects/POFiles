import * as XLSX from "xlsx";
import type { ParsedPOFile, ParsedPallet } from "./po-parser";
import type { POValidationResult } from "./po-validation";
import { PALLET_FIELDS } from "./types";

function textCell(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

export const STOCK_PALLET_HEADERS = [
  "EDI File Name",
  "Season",
  "locn_code",
  "orgzn",
  "stuff_date",
  "container",
  "seal_number",
  "Sscc",
  "plt_qty",
  "ctn_qty",
  "Actual Gross Weight",
  "Actual Nett Weight",
  "commodity",
  "variety",
  "grade",
  "pack",
  "size_count",
  "mark",
  "targ_mkt",
  "country",
  "farm",
  "Packh_code",
  "Orchard",
  "Inspec_date",
  "Inspect_pnt",
  "Inspector",
  "orig_intake",
  "orig_cons",
  "cons_no",
  "UPN",
  "record type",
  "load_id",
  "pallet_id",
  "seq_no",
  "unit_type",
  "position",
  "sender",
  "agent",
  "ship_sender",
  "ship_agent",
  "dest_type",
  "dest_locn",
  "cont_split",
  "channel",
  "comm_grp",
  "var_grp",
  "sub_var",
  "act_var",
  "inv_code",
  "pick_ref",
  "prod_grp",
  "prod_char",
  "Calc Plt Qty",
  "mixed_ind",
  "remarks",
  "reason",
  "intake_date",
  "orig_depot",
  "shift",
  "shift_date",
  "order_no",
  "store",
  "stock_pool",
  "shipped_date",
  "xmit_flag",
  "revision",
  "mesg_no",
  "tran_user",
  "tran_date",
  "tran_time",
  "pallet_btype",
  "ship number",
  "temperature",
  "combo_pallet_id",
  "temp_device_id",
  "temp_device_type",
  "boe_no",
  "principal",
  "mass",
  "Saftbin1",
  "Saftbin2",
  "Saftbin3",
  "Orig_account",
  "Re-Inspection Date",
  "Stack_variance",
  "Store_type",
  "Batch_no",
  "Waybill_no",
  "Gtin",
  "Steri_flag",
  "Steri_dest",
  "Label_type",
  "Prov Flag",
  "SellbyCode",
  "Combo_sscc",
  "Expiry_code",
  "Target_region",
  "Target_country",
  "Global_gap_number",
  "Lot no",
  "Traceability_code",
  "Orig_inspec_date",
  "Inner_pack",
  "Inner_cartons",
  "Production_id",
  "Protocol_exception_indicator",
  "Original Document Number",
  "Pallet_treatment",
  "Weighing Location",
  "Weighing Date Time",
  "Main Area",
  "Production Area",
  "location_type",
  "document_number",
  "actual_grade",
  "intake_time",
  "intake_point",
  "pallet_marks",
  "ctn_qtyrej",
  "ctn_qtydiscarded",
  "ctn_qtyeval",
  "loading_port",
  "load_ref",
  "shipped_time",
  "consec_no",
  "stuff_time",
  "load_depot",
  "calc_method",
  "temp_min",
  "temp_max",
  "invoiced",
  "cont_type",
  "container_ref",
  "container_size",
  "ship_line",
  "SamsaAccredit(Pallet)",
  "SamsaAccredit(Container)",
  "ContainerTareWeight",
  "ContainerGrossMass",
  "Phyto_data",
  "Cust_ord",
  "Re_inspec_doc",
  "PM Orig SSCC",
  "PM Orig Seq",
  "PM Qty Reduced",
  "PM ID",
  "client_ref",
  "Client Reference",
] as const;

type LineSelector = { recordType: string; from: number; to: number };

const OP_COLUMNS: Partial<Record<(typeof STOCK_PALLET_HEADERS)[number], LineSelector>> = {
  Season: { recordType: "OP", from: 596, to: 599 },
  locn_code: { recordType: "OP", from: 196, to: 202 },
  orgzn: { recordType: "OP", from: 74, to: 75 },
  container: { recordType: "OP", from: 61, to: 71 },
  Sscc: { recordType: "OP", from: 316, to: 333 },
  plt_qty: { recordType: "OP", from: 136, to: 144 },
  ctn_qty: { recordType: "OP", from: 131, to: 135 },
  "Actual Gross Weight": { recordType: "OP", from: 700, to: 709 },
  "Actual Nett Weight": { recordType: "OP", from: 334, to: 342 },
  commodity: { recordType: "OP", from: 80, to: 81 },
  variety: { recordType: "OP", from: 84, to: 86 },
  grade: { recordType: "OP", from: 97, to: 100 },
  pack: { recordType: "OP", from: 93, to: 96 },
  size_count: { recordType: "OP", from: 106, to: 110 },
  mark: { recordType: "OP", from: 101, to: 105 },
  targ_mkt: { recordType: "OP", from: 129, to: 130 },
  country: { recordType: "OP", from: 76, to: 77 },
  farm: { recordType: "OP", from: 117, to: 123 },
  Packh_code: { recordType: "OP", from: 451, to: 457 },
  Orchard: { recordType: "OP", from: 514, to: 528 },
  Inspec_date: { recordType: "OP", from: 397, to: 404 },
  Inspect_pnt: { recordType: "OP", from: 498, to: 503 },
  Inspector: { recordType: "OP", from: 492, to: 497 },
  orig_intake: { recordType: "OP", from: 173, to: 180 },
  orig_cons: { recordType: "OP", from: 255, to: 264 },
  cons_no: { recordType: "OP", from: 51, to: 60 },
  UPN: { recordType: "OP", from: 645, to: 669 },
  "record type": { recordType: "OP", from: 1, to: 2 },
  load_id: { recordType: "OP", from: 3, to: 12 },
  pallet_id: { recordType: "OP", from: 13, to: 21 },
  seq_no: { recordType: "OP", from: 22, to: 26 },
  unit_type: { recordType: "OP", from: 27, to: 27 },
  dest_type: { recordType: "OP", from: 42, to: 43 },
  dest_locn: { recordType: "OP", from: 44, to: 50 },
  cont_split: { recordType: "OP", from: 72, to: 72 },
  channel: { recordType: "OP", from: 73, to: 73 },
  comm_grp: { recordType: "OP", from: 78, to: 79 },
  var_grp: { recordType: "OP", from: 82, to: 83 },
  sub_var: { recordType: "OP", from: 87, to: 89 },
  act_var: { recordType: "OP", from: 90, to: 92 },
  inv_code: { recordType: "OP", from: 111, to: 112 },
  pick_ref: { recordType: "OP", from: 113, to: 116 },
  prod_grp: { recordType: "OP", from: 124, to: 125 },
  prod_char: { recordType: "OP", from: 126, to: 128 },
  "Calc Plt Qty": { recordType: "OP", from: 136, to: 144 },
  mixed_ind: { recordType: "OP", from: 145, to: 145 },
  remarks: { recordType: "OP", from: 146, to: 153 },
  reason: { recordType: "OP", from: 154, to: 157 },
  intake_date: { recordType: "OP", from: 158, to: 165 },
  orig_depot: { recordType: "OP", from: 166, to: 172 },
  shift: { recordType: "OP", from: 181, to: 181 },
  shift_date: { recordType: "OP", from: 182, to: 189 },
  order_no: { recordType: "OP", from: 190, to: 195 },
  store: { recordType: "OP", from: 203, to: 204 },
  stock_pool: { recordType: "OP", from: 205, to: 206 },
  shipped_date: { recordType: "OP", from: 207, to: 219 },
  xmit_flag: { recordType: "OP", from: 220, to: 220 },
  revision: { recordType: "OP", from: 221, to: 225 },
  tran_date: { recordType: "OP", from: 241, to: 248 },
  tran_time: { recordType: "OP", from: 249, to: 253 },
  pallet_btype: { recordType: "OP", from: 254, to: 254 },
  "ship number": { recordType: "OP", from: 265, to: 270 },
  temperature: { recordType: "OP", from: 271, to: 276 },
  combo_pallet_id: { recordType: "OP", from: 277, to: 285 },
  temp_device_id: { recordType: "OP", from: 286, to: 305 },
  temp_device_type: { recordType: "OP", from: 306, to: 307 },
  boe_no: { recordType: "OP", from: 308, to: 313 },
  principal: { recordType: "OP", from: 314, to: 315 },
  mass: { recordType: "OP", from: 334, to: 342 },
  Saftbin1: { recordType: "OP", from: 343, to: 358 },
  Saftbin2: { recordType: "OP", from: 359, to: 374 },
  Saftbin3: { recordType: "OP", from: 375, to: 390 },
  Orig_account: { recordType: "OP", from: 391, to: 396 },
  "Re-Inspection Date": { recordType: "OP", from: 600, to: 607 },
  Stack_variance: { recordType: "OP", from: 405, to: 405 },
  Store_type: { recordType: "OP", from: 406, to: 406 },
  Batch_no: { recordType: "OP", from: 407, to: 426 },
  Waybill_no: { recordType: "OP", from: 427, to: 436 },
  Gtin: { recordType: "OP", from: 437, to: 450 },
  Steri_flag: { recordType: "OP", from: 458, to: 459 },
  Steri_dest: { recordType: "OP", from: 460, to: 461 },
  Label_type: { recordType: "OP", from: 462, to: 462 },
  "Prov Flag": { recordType: "OP", from: 463, to: 463 },
  SellbyCode: { recordType: "OP", from: 464, to: 473 },
  Combo_sscc: { recordType: "OP", from: 474, to: 491 },
  Expiry_code: { recordType: "OP", from: 504, to: 513 },
  Target_region: { recordType: "OP", from: 529, to: 533 },
  Target_country: { recordType: "OP", from: 534, to: 535 },
  Global_gap_number: { recordType: "OP", from: 536, to: 555 },
  "Lot no": { recordType: "OP", from: 556, to: 575 },
  Traceability_code: { recordType: "OP", from: 576, to: 595 },
  Orig_inspec_date: { recordType: "OP", from: 600, to: 607 },
  Inner_pack: { recordType: "OP", from: 608, to: 617 },
  Inner_cartons: { recordType: "OP", from: 618, to: 622 },
  Production_id: { recordType: "OP", from: 623, to: 642 },
  Protocol_exception_indicator: { recordType: "OP", from: 643, to: 644 },
  Pallet_treatment: { recordType: "OP", from: 670, to: 699 },
  "Weighing Location": { recordType: "OP", from: 720, to: 726 },
  "Weighing Date Time": { recordType: "OP", from: 727, to: 739 },
  "Main Area": { recordType: "OP", from: 740, to: 741 },
  "Production Area": { recordType: "OP", from: 742, to: 757 },
  Phyto_data: { recordType: "OP", from: 758, to: 767 },
  Cust_ord: { recordType: "OP", from: 768, to: 807 },
  Re_inspec_doc: { recordType: "OP", from: 808, to: 817 },
};

function findRecord(parsed: ParsedPOFile, recordType: string): string {
  return parsed.records.find((record) => record.recordType === recordType)?.raw ?? "";
}

function calculatedGrossWeight(pallet: ParsedPallet): string {
  const nettWeight = Number(pallet.nettMass);
  const cartonQuantity = Number(pallet.cartons);

  if (!Number.isFinite(nettWeight) || !Number.isFinite(cartonQuantity)) {
    return pallet.grossMass || "";
  }

  return pallet.grossMass || String(nettWeight + cartonQuantity * 0.65);
}

function readColumn(
  parsed: ParsedPOFile,
  pallet: ParsedPallet | null,
  header: (typeof STOCK_PALLET_HEADERS)[number],
  fileName: string,
): string {
  if (header === "EDI File Name") return fileName;

  // For pallet-specific data, read from the pallet object
  if (pallet) {
    if (header === "pallet_id") return pallet.palletId || "";
    if (header === "Sscc") return pallet.sscc || "";
    if (header === "ctn_qty") return pallet.cartons || "";
    if (header === "plt_qty" || header === "Calc Plt Qty") return pallet.palletQuantity || "";
    if (header === "Actual Gross Weight") return pallet.grossMass || calculatedGrossWeight(pallet);
    if (header === "Actual Nett Weight" || header === "mass") return pallet.nettMass || "";
  }

  const layout = OP_COLUMNS[header];
  if (layout && layout.recordType === "OP" && pallet) {
    // For OP record fields, read from pallet
    const field = Object.entries(pallet).find(([key, value]) => {
      const fieldDef = PALLET_FIELDS.find((f) => f.key === key);
      return fieldDef && fieldDef.from === layout.from && fieldDef.to === layout.to;
    });
    if (field) return String(field[1]);
  }

  if (layout)
    return findRecord(parsed, layout.recordType)
      .slice(layout.from - 1, layout.to)
      .trim();
  if (header === "stuff_date") return findRecord(parsed, "OC").slice(33, 41).trim();
  if (header === "seal_number") {
    const okRecord = findRecord(parsed, "OK");
    return okRecord.slice(30, 45).trim() || okRecord.slice(225, 240).trim();
  }
  if (header === "load_ref") return findRecord(parsed, "OH").slice(12, 47).trim();
  return "";
}

const DATE_COLUMNS = new Set([
  "stuff_date",
  "Inspec_date",
  "orig_intake",
  "shift_date",
  "shipped_date",
  "tran_date",
  "intake_date",
  "Orig_inspec_date",
]);

const NUMBER_COLUMNS = new Set(["seq_no"]);

// These values must keep the numeric amount supplied by the PO file. Do not
// round them to a fixed number of decimal places during the Excel conversion.
const QUANTITY_COLUMNS = new Set(["Calc Plt Qty"]);

const DECIMAL_2_COLUMNS = new Set(["Actual Gross Weight", "Actual Nett Weight", "mass"]);

function formatExcelValue(header: (typeof STOCK_PALLET_HEADERS)[number], value: string): string {
  if (
    (header === "ctn_qty" || header === "plt_qty" || QUANTITY_COLUMNS.has(header)) &&
    /^-?\d+(?:\.\d+)?$/.test(value)
  ) {
    return String(Number(value).toFixed(2));
  }
  if (DECIMAL_2_COLUMNS.has(header) && /^-?\d+(?:\.\d+)?$/.test(value)) {
    return String(Number(value).toFixed(2));
  }
  if (NUMBER_COLUMNS.has(header) && /^-?\d+(?:\.\d+)?$/.test(value)) {
    return String(Number(value));
  }
  if (DATE_COLUMNS.has(header)) {
    // Some PO date fields, such as shipped_date, contain the date followed by
    // a time. Only use the first eight characters (yyyyMMdd) for the Excel date.
    const datePart = value.trim().slice(0, 8);

    if (/^\d{8}$/.test(datePart)) {
      return `${datePart.slice(0, 4)}/${datePart.slice(4, 6)}/${datePart.slice(6, 8)}`;
    }
  }
  if (header === "Weighing Date Time" && /^\d{10}:\d{2}$/.test(value)) {
    return `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6, 8)}`;
  }
  return value;
}

/**
 * Business Central assigns the sequence within each SSCC group in descending
 * source-file order. For example, four OP records for the same SSCC receive
 * sequence numbers 4, 3, 2 and 1. A single OP record receives sequence 1.
 */
function calculateSequenceNumbers(pallets: ParsedPallet[]): string[] {
  const totalBySscc = new Map<string, number>();
  const processedBySscc = new Map<string, number>();

  for (const pallet of pallets) {
    const sscc = (pallet.sscc || "").trim();

    totalBySscc.set(sscc, (totalBySscc.get(sscc) ?? 0) + 1);
  }

  return pallets.map((pallet) => {
    const rawSequence = (pallet.sequenceNumber || "").trim();
    if (rawSequence) {
      return rawSequence;
    }

    const sscc = (pallet.sscc || "").trim();
    const total = totalBySscc.get(sscc) ?? 1;
    const processed = processedBySscc.get(sscc) ?? 0;
    const sequenceNumber = total - processed;

    processedBySscc.set(sscc, processed + 1);

    return String(sequenceNumber);
  });
}

function stockPalletSheet(parsed: ParsedPOFile, fileName: string): XLSX.WorkSheet {
  const sequenceNumbers = calculateSequenceNumbers(parsed.pallets);

  const dataRows = parsed.pallets.map((pallet, palletIndex) =>
    STOCK_PALLET_HEADERS.map((header) => {
      const value =
        header === "seq_no"
          ? sequenceNumbers[palletIndex]
          : readColumn(parsed, pallet, header, fileName);

      return formatExcelValue(header, value);
    }),
  );

  const rows = [[...STOCK_PALLET_HEADERS], ...dataRows];

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = STOCK_PALLET_HEADERS.map((header) => ({
    wch: Math.max(12, Math.min(24, header.length + 2)),
  }));

  return sheet;
}

export function convertedWorkbook(
  parsed: ParsedPOFile,
  validation: POValidationResult,
  fileName = "",
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, stockPalletSheet(parsed, fileName), "Stock Pallet");
  return workbook;
}

export function convertedFileName(originalFileName: string): string {
  const cleanFileName = originalFileName.trim().replace(/^.*[\\/]/, "");
  const baseName = cleanFileName.replace(/\.[^.]+$/, "") || "po-file";
  return `${baseName}_converted.xlsx`;
}

export function convertedWorkbookFileName(
  originalFileName: string,
  _parsed?: ParsedPOFile,
): string {
  return convertedFileName(originalFileName);
}

export function downloadConvertedWorkbook(
  originalFileName: string,
  parsed: ParsedPOFile,
  validation: POValidationResult,
): void {
  const workbook = convertedWorkbook(parsed, validation, originalFileName);
  const downloadFileName = convertedWorkbookFileName(originalFileName);
  XLSX.writeFile(workbook, downloadFileName);
}
