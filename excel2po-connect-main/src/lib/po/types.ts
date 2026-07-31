import type { FixedWidthError } from "./fixed-width";

export type ValidationIssue = FixedWidthError;

export interface POHeaderInput {
  sourceAddress: string;
  destinationAddress: string;
  sequenceNumber: string;
  batchNumber: string;
  loadId?: string;
  loadReference?: string;
  locationCode: string;
  containerNumber: string;
  sealNumber: string;
  consignmentNumber: string;
  organisationCode: string;
  countryCode: string;
  channel: string;
  destinationType: string;
  destinationLocation: string;
  stuffingDate?: string;
  transactionDate?: string;
  transactionTime?: string;
  provider: string;
  version: string;
  fileName?: string;
}

/** Canonical PO pallet fields that can be mapped from Excel columns. */
export const PALLET_FIELDS = [
  { key: "palletId", label: "Pallet ID / Barcode", recordType: "OP", from: 13, to: 21, type: "alpha", required: true },
  { key: "sscc", label: "SSCC", recordType: "OP", from: 316, to: 333, type: "alpha", required: false },
  { key: "cartons", label: "Carton Quantity", recordType: "OP", from: 131, to: 135, type: "numeric", required: true },
  { key: "palletQuantity", label: "Pallet Quantity", recordType: "OP", from: 136, to: 144, type: "numeric", required: false },
  { key: "grossMass", label: "Pallet Gross Mass", recordType: "OP", from: 700, to: 709, type: "numeric", required: false },
  { key: "nettMass", label: "Nett Mass", recordType: "OP", from: 334, to: 342, type: "numeric", required: false },
  { key: "commodity", label: "Commodity", recordType: "OP", from: 80, to: 81, type: "alpha", required: false },
  { key: "variety", label: "Variety", recordType: "OP", from: 84, to: 86, type: "alpha", required: false },
  { key: "grade", label: "Grade", recordType: "OP", from: 97, to: 100, type: "alpha", required: false },
  { key: "pack", label: "Pack", recordType: "OP", from: 93, to: 96, type: "alpha", required: false },
  { key: "sizeCount", label: "Size Count", recordType: "OP", from: 106, to: 110, type: "alpha", required: false },
  { key: "mark", label: "Mark", recordType: "OP", from: 101, to: 105, type: "alpha", required: false },
  { key: "targetMarket", label: "Target Market", recordType: "OP", from: 129, to: 130, type: "alpha", required: false },
  { key: "country", label: "Country", recordType: "OP", from: 76, to: 77, type: "alpha", required: false },
  { key: "targetCountry", label: "Target Country", recordType: "OP", from: 534, to: 535, type: "alpha", required: false },
  { key: "farm", label: "Farm", recordType: "OP", from: 117, to: 123, type: "alpha", required: false },
  { key: "packhouseCode", label: "Packhouse Code", recordType: "OP", from: 451, to: 457, type: "alpha", required: false },
  { key: "orchard", label: "Orchard", recordType: "OP", from: 514, to: 528, type: "alpha", required: false },
  { key: "inspectionDate", label: "Inspection Date", recordType: "OP", from: 397, to: 404, type: "date", required: false },
  { key: "inspectionPoint", label: "Inspection Point", recordType: "OP", from: 498, to: 503, type: "alpha", required: false },
  { key: "inspector", label: "Inspector", recordType: "OP", from: 492, to: 497, type: "alpha", required: false },
  { key: "originalIntakeDate", label: "Original Intake Date", recordType: "OP", from: 173, to: 180, type: "date", required: false },
  { key: "season", label: "Season", recordType: "OP", from: 596, to: 599, type: "alpha", required: false },
  { key: "upn", label: "UPN", recordType: "OP", from: 645, to: 669, type: "alpha", required: false },
  { key: "phytoData", label: "Phyto Data", recordType: "OP", from: 758, to: 767, type: "alpha", required: false },
  { key: "productionArea", label: "Production Area", recordType: "OP", from: 742, to: 757, type: "alpha", required: false },
  { key: "inventoryCode", label: "Inventory Code", recordType: "OP", from: 111, to: 112, type: "alpha", required: false },
] as const;

export type PalletFieldKey = (typeof PALLET_FIELDS)[number]["key"];

/** mapping: PO field key -> Excel header name */
export type ColumnMapping = Partial<Record<PalletFieldKey, string>>;

export interface PalletRow {
  excelRow: number;
  values: Partial<Record<PalletFieldKey, unknown>>;
}

export interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  conversionId: string;
  module: string;
  action: string;
  excelRow?: number;
  field?: string;
  message?: string;
}

export interface GenerationResult {
  conversionId: string;
  status: "Completed" | "Validation Failed" | "Failed";
  fileName: string;
  content: string;
  recordCount: number;
  palletCount: number;
  cartonCount: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  logs: LogEntry[];
  recordLengths: { recordType: string; length: number; expected: number; ok: boolean }[];
}
