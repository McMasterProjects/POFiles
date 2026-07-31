import { PALLET_FIELDS, type ColumnMapping, type PalletFieldKey, type POHeaderInput } from "./types";

/** Heuristic auto-mapping of Excel headers onto PO pallet fields. */
const SYNONYMS: Record<PalletFieldKey, string[]> = {
  palletId: ["barcode", "pallet id", "palletid", "pallet no", "pallet number", "sscc/barcode"],
  sscc: ["sscc", "sscc18", "sscc code"],
  cartons: ["cartons", "carton qty", "carton quantity", "ctns", "quantity", "qty"],
  palletQuantity: ["pallet qty", "pallet quantity", "pallets"],
  grossMass: ["gross mass", "gross weight", "grossmass", "gross"],
  nettMass: ["nett mass", "net mass", "net weight", "nett weight", "nett"],
  commodity: ["commodity", "commodity code", "product"],
  variety: ["variety", "variety code", "cultivar"],
  grade: ["grade", "class"],
  pack: ["pack", "pack code", "packaging"],
  sizeCount: ["count", "size", "size count", "size/count"],
  mark: ["mark", "brand"],
  targetMarket: ["target market", "market"],
  country: ["country", "country of origin", "origin"],
  targetCountry: ["target country", "destination country"],
  farm: ["farm", "farm code", "puc", "production unit"],
  packhouseCode: ["phc", "packhouse", "packhouse code"],
  orchard: ["orchard", "orchard code", "block"],
  inspectionDate: ["inspection date", "insp date"],
  inspectionPoint: ["inspection point", "insp point"],
  inspector: ["inspector", "inspector code"],
  originalIntakeDate: ["original intake date", "intake date", "pack date", "packing date"],
  season: ["season", "year"],
  upn: ["upn", "unique pallet number"],
  phytoData: ["phyto", "phyto data", "phytosanitary"],
  productionArea: ["production area", "prod area", "area"],
  inventoryCode: ["inventory", "inventory code", "inv code"],
};

const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();

export function suggestMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<string>();

  for (const field of PALLET_FIELDS) {
    const candidates = SYNONYMS[field.key] ?? [];
    const match = headers.find((h) => {
      if (used.has(h)) return false;
      const n = norm(h);
      return candidates.some((c) => n === norm(c));
    }) ?? headers.find((h) => {
      if (used.has(h)) return false;
      const n = norm(h);
      return candidates.some((c) => n.includes(norm(c)));
    });

    if (match) {
      mapping[field.key] = match;
      used.add(match);
    }
  }
  return mapping;
}

const HEADER_SYNONYMS: Record<keyof POHeaderInput, string[]> = {
  containerNumber: ["container number", "container no", "container", "cntr no"],
};

export function suggestHeaderValues(headers: string[], previewRows: Record<string, string>[]) {
  const suggested: Partial<POHeaderInput> = {};
  const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  const preferredRow = previewRows.find((row) => Object.values(row).some((v) => v.trim().length > 0));

  for (const field of Object.keys(HEADER_SYNONYMS) as Array<keyof POHeaderInput>) {
    const candidates = HEADER_SYNONYMS[field];
    const match = headers.find((h) => candidates.some((c) => norm(h) === norm(c))) ?? headers.find((h) => candidates.some((c) => norm(h).includes(norm(c)) || norm(c).includes(norm(h))));
    if (match && preferredRow) {
      const value = String(preferredRow[match] ?? "").trim();
      if (value) suggested[field] = value;
    }
  }

  return suggested;
}

export function applyMapping(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping,
  firstDataRowNumber = 2,
) {
  return rows.map((raw, index) => ({
    excelRow: firstDataRowNumber + index,
    values: Object.fromEntries(
      Object.entries(mapping)
        .filter(([, header]) => !!header)
        .map(([key, header]) => [key, raw[header as string]]),
    ) as Record<string, unknown>,
  }));
}
