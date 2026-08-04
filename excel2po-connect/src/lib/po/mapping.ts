import {
  PALLET_FIELDS,
  type ColumnMapping,
  type PalletFieldKey,
  type POHeaderInput,
} from "./types";

/** Heuristic auto-mapping of Excel headers onto PO pallet fields. */
const SYNONYMS: Record<PalletFieldKey, string[]> = {
  palletId: [
    "barcode",
    "pallet id",
    "palletid",
    "pallet no",
    "pallet number",
    "sscc/barcode",
    "pallet_id",
    "combo pallet id",
    "combo_pallet_id",
  ],
  sscc: ["sscc", "sscc18", "sscc code", "combo sscc", "combo_sscc"],
  cartons: [
    "cartons",
    "carton qty",
    "carton quantity",
    "ctns",
    "quantity",
    "qty",
    "ctn qty",
    "ctn_qty",
  ],
  palletQuantity: [
    "pallet qty",
    "pallet quantity",
    "pallets",
    "plt qty",
    "plt_qty",
    "calc plt qty",
    "calc plt qty",
  ],
  grossMass: [
    "gross mass",
    "gross weight",
    "grossmass",
    "gross",
    "actual gross weight",
    "actual gross mass",
    "calc gross weight",
    "calc gross mass",
    "calculated gross weight",
    "calculated gross mass",
  ],
  nettMass: [
    "nett mass",
    "net mass",
    "net weight",
    "nett weight",
    "nett",
    "actual nett weight",
    "actual net weight",
    "calc nett weight",
    "calc net weight",
    "calculated nett weight",
    "calculated net weight",
  ],
  commodity: ["commodity", "commodity code", "product"],
  variety: ["variety", "variety code", "cultivar"],
  grade: ["grade", "class"],
  pack: ["pack", "pack code", "packaging"],
  sizeCount: ["count", "size", "size count", "size/count"],
  mark: ["mark", "brand"],
  targetMarket: ["target market", "market", "targ mkt", "targ_mkt"],
  country: ["country", "country of origin", "origin"],
  targetCountry: ["target country", "destination country", "target_country"],
  farm: ["farm", "farm code", "puc", "production unit"],
  packhouseCode: [
    "phc",
    "packhouse",
    "packhouse code",
    "packh code",
    "packh_code",
    "pack house code",
  ],
  orchard: ["orchard", "orchard code", "block"],
  inspectionDate: [
    "inspection date",
    "insp date",
    "inspec date",
    "inspec_date",
    "orig inspec date",
    "orig_inspec_date",
  ],
  inspectionPoint: ["inspection point", "insp point", "inspect pnt", "inspect_pnt"],
  inspector: ["inspector", "inspector code"],
  originalIntakeDate: [
    "original intake date",
    "intake date",
    "pack date",
    "packing date",
    "orig intake",
    "orig intake date",
    "orig_intake",
    "orig_intake_date",
  ],
  season: ["season", "year"],
  upn: ["upn", "unique pallet number"],
  phytoData: ["phyto", "phyto data", "phytosanitary", "phyto_data"],
  productionArea: ["production area", "prod area", "area", "production_area"],
  inventoryCode: ["inventory", "inventory code", "inv code", "inv_code"],
  commGrp: ["comm_grp", "comm group", "commgrp"],
  varGrp: ["var_grp", "var variety", "variety group", "var grp"],
  subVar: ["sub_var", "sub var"],
  actVar: ["act_var", "act var", "actual variety"],
  pickRef: ["pick_ref", "pick ref", "pick reference"],
  prodGrp: ["prod_grp", "prod group", "production group"],
  prodChar: ["prod_char", "prod char", "production char"],
  remarks: ["remarks"],
  reason: ["reason"],
  shift: ["shift"],
  shiftDate: ["shift_date", "shift date"],
  store: ["store"],
  stockPool: ["stock_pool", "stock pool"],
  shippedDate: ["shipped_date", "shipped date", "load out date"],
  origCons: ["orig_cons", "orig cons", "original consignment"],
  shipNumber: ["ship number", "ship_no", "ship no"],
  temperature: ["temperature", "temp"],
  comboPalletId: ["combo_pallet_id", "combo pallet id"],
  tempDeviceId: ["temp_device_id", "temp device id", "temperature device id"],
  tempDeviceType: ["temp_device_type", "temp device type", "temperature device type"],
  boeNo: ["boe_no", "boe no", "boe"],
  principal: ["principal"],
  saftbin1: ["saftbin1", "saft bin1"],
  saftbin2: ["saftbin2", "saft bin2"],
  saftbin3: ["saftbin3", "saft bin3"],
  origAccount: ["orig_account", "orig account", "original account"],
  stackVariance: ["stack_variance", "stack variance"],
  storeType: ["store_type", "store type"],
  batchNo: ["batch_no", "batch no"],
  waybillNo: ["waybill_no", "waybill no"],
  gtin: ["gtin"],
  steriFlag: ["steri_flag", "steri flag"],
  steriDest: ["steri_dest", "steri dest"],
  labelType: ["label_type", "label type"],
  provFlag: ["prov flag", "prov_flag", "provisional flag"],
  sellbyCode: ["sellbycode", "sellby code", "sellby_code"],
  comboSscc: ["combo_sscc", "combo sscc"],
  expiryCode: ["expiry_code", "expiry code", "expirycode"],
  targetRegion: ["target_region", "target region"],
  globalGapNumber: ["global_gap_number", "global gap number"],
  lotNo: ["lot no", "lot_no", "lot number"],
  traceabilityCode: ["traceability_code", "traceability code"],
  origInspectionDate: ["orig_inspec_date", "orig inspection date", "original inspection date"],
  innerPack: ["inner_pack", "inner pack"],
  innerCartons: ["inner_cartons", "inner cartons"],
  productionId: ["production_id", "production id"],
  protocolExceptionIndicator: ["protocol_exception_indicator", "protocol exception indicator"],
  custOrd: ["cust_ord", "cust ord", "customer order"],
  reInspectionDocument: ["re_inspec_doc", "re inspection doc", "reinspection document"],
  agreementCode: ["agreement code", "agreement_code"],
  postTreatment: ["post treatment", "post_treatment"],
  referenceNumber: ["reference no", "reference number", "reference_no"],
  eLotKey: ["e lot key", "e lot", "e lot key old", "eLot_Key"],
  palletTreatment: ["pallet_treatment", "pallet treatment"],
  weighingLocation: ["weighing location", "weighing_location"],
  weighingDateTime: ["weighing date time", "weighing datetime", "weighing_date_time"],
  mainArea: ["main area", "main_area"],
  actualGrade: ["actual_grade", "actual grade"],
  samsaAccreditation: [
    "samsa accreditation",
    "samsa accredit pallet",
    "samsaaccredit pallet",
    "samsaaccredit",
  ],
};

const norm = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function suggestMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<string>();

  for (const field of PALLET_FIELDS) {
    const candidates = SYNONYMS[field.key] ?? [];
    const match =
      headers.find((h) => {
        if (used.has(h)) return false;
        const n = norm(h);
        return candidates.some((c) => n === norm(c));
      }) ??
      headers.find((h) => {
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

const HEADER_SYNONYMS: Partial<Record<keyof POHeaderInput, string[]>> = {
  containerNumber: [
    "container number",
    "container no",
    "container",
    "cntr no",
    "container_number",
    "container_no",
  ],
  loadId: [
    "load id",
    "loadid",
    "load number",
    "load no",
    "load_number",
    "load_no",
    "loadnum",
    "load num",
    "booking no",
    "booking number",
    "booking id",
  ],
  loadReference: [
    "load reference",
    "load ref",
    "load_reference",
    "load_ref",
    "load ref number",
    "load reference number",
    "loadref",
    "booking reference",
    "booking ref",
    "reference",
    "ref no",
    "ref number",
  ],
  locationCode: [
    "location code",
    "location",
    "locn code",
    "loc code",
    "locn",
    "location_code",
    "locn_code",
    "locationcode",
    "destination location",
    "dest location",
    "dest_locn",
    "destloc",
  ],
  sealNumber: [
    "seal number",
    "seal no",
    "seal_number",
    "seal_no",
    "seal",
    "seal no.",
  ],
  organisationCode: [
    "organisation code",
    "organization code",
    "organisation",
    "organization",
    "org code",
    "org_code",
    "org",
    "orgn code",
    "orgn_code",
    "company code",
    "client code",
  ],
  stuffingDate: [
    "stuffing date",
    "stuff date",
    "stuffing_date",
    "stuff_date",
    "stuffing",
    "loading date",
    "load date",
    "departure date",
    "load_date",
    "loading_date",
  ],
};

export function suggestHeaderValues(headers: string[], previewRows: Record<string, string>[]) {
  const suggested: Partial<POHeaderInput> = {};
  const norm = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const HEADER_TOKEN_FALLBACK: Partial<Record<keyof POHeaderInput, string[]>> = {
    loadId: ["load", "id"],
    loadReference: ["load", "ref"],
    locationCode: ["location"],
    sealNumber: ["seal"],
    organisationCode: ["organis", "org"],
    stuffingDate: ["stuff", "date"],
    containerNumber: ["container"],
  };

  for (const field of Object.keys(HEADER_SYNONYMS) as Array<keyof POHeaderInput>) {
    const candidates = HEADER_SYNONYMS[field] ?? [];
    const match =
      headers.find((h) => candidates.some((c) => norm(h) === norm(c))) ??
      headers.find((h) =>
        candidates.some((c) => norm(h).includes(norm(c)) || norm(c).includes(norm(h))),
      ) ??
      headers.find((h) => {
        const tokens = HEADER_TOKEN_FALLBACK[field];
        return (
          tokens !== undefined &&
          tokens.every((token) => norm(h).includes(token))
        );
      });

    if (!match) continue;

    const value = previewRows
      .map((row) => String(row[match] ?? "").trim())
      .find((text) => text.length > 0);

    if (value) suggested[field] = value;
  }

  return suggested;
}

export function suggestHeaderMappings(
  headers: string[],
  previewRows: Record<string, string>[],
): Partial<Record<keyof POHeaderInput, string>> {
  const suggested: Partial<Record<keyof POHeaderInput, string>> = {};
  const norm = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const HEADER_TOKEN_FALLBACK: Partial<Record<keyof POHeaderInput, string[]>> = {
    loadId: ["load", "id"],
    loadReference: ["load", "ref"],
    locationCode: ["location"],
    sealNumber: ["seal"],
    organisationCode: ["organis", "org"],
    stuffingDate: ["stuff", "date"],
    containerNumber: ["container"],
  };

  for (const field of Object.keys(HEADER_SYNONYMS) as Array<keyof POHeaderInput>) {
    const candidates = HEADER_SYNONYMS[field] ?? [];
    const match =
      headers.find((h) => candidates.some((c) => norm(h) === norm(c))) ??
      headers.find((h) =>
        candidates.some((c) => norm(h).includes(norm(c)) || norm(c).includes(norm(h))),
      ) ??
      headers.find((h) => {
        const tokens = HEADER_TOKEN_FALLBACK[field];
        return (
          tokens !== undefined &&
          tokens.every((token) => norm(h).includes(token))
        );
      });

    if (!match) continue;

    const value = previewRows
      .map((row) => String(row[match] ?? "").trim())
      .find((text) => text.length > 0);

    if (value) suggested[field] = match;
  }

  return suggested;
}

export function resolveBackendMapping(headers: string[], mapping: ColumnMapping): ColumnMapping {
  const effectiveMapping = { ...mapping };
  const hardCodedHeader = "Barcode";
  const matchingHeader = headers.find(
    (header) => header.toLowerCase() === hardCodedHeader.toLowerCase(),
  );

  if (matchingHeader) {
    effectiveMapping.palletId = matchingHeader;
  }

  return effectiveMapping;
}

export function getMappingOptionLabel(header: string, fieldKey?: PalletFieldKey) {
  const field = fieldKey ? PALLET_FIELDS.find((entry) => entry.key === fieldKey) : undefined;
  const label = field?.label;

  if (!label || header === label) return header;
  return `${header} — ${label}`;
}

export function applyMapping(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping,
  headers: string[],
  firstDataRowNumber = 2,
) {
  const resolvedMapping = resolveBackendMapping(headers, mapping);

  return rows.map((raw, index) => ({
    excelRow: firstDataRowNumber + index,
    values: Object.fromEntries(
      Object.entries(resolvedMapping)
        .filter(([, header]) => !!header)
        .map(([key, header]) => [key, raw[header as string]]),
    ) as Record<string, unknown>,
  }));
}
