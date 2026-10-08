import { RECORD_LENGTHS } from "./builders";
import { PALLET_FIELDS } from "./types";

export const SUPPORTED_PO_RECORD_TYPES = ["BH", "OH", "OL", "OK", "OC", "OP", "BT"] as const;

export type SupportedPORecordType = (typeof SUPPORTED_PO_RECORD_TYPES)[number];

export const PO_RECORD_LAYOUTS = {
  BH: { length: RECORD_LENGTHS.BH },
  OH: { length: RECORD_LENGTHS.OH },
  OL: { length: RECORD_LENGTHS.OL },
  OK: { length: RECORD_LENGTHS.OK },
  OC: { length: RECORD_LENGTHS.OC },
  OP: { length: RECORD_LENGTHS.OP, fields: PALLET_FIELDS },
  BT: { length: RECORD_LENGTHS.BT },
} as const;

export function isSupportedPORecordType(value: string): value is SupportedPORecordType {
  return (SUPPORTED_PO_RECORD_TYPES as readonly string[]).includes(value);
}
