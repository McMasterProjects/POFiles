//#region node_modules/.nitro/vite/services/ssr/assets/mapping-DJBRHONd.js
/** Canonical PO pallet fields that can be mapped from Excel columns. */
var PALLET_FIELDS = [
	{
		key: "palletId",
		label: "Pallet ID / Barcode",
		recordType: "OP",
		from: 13,
		to: 21,
		type: "alpha",
		required: true
	},
	{
		key: "sscc",
		label: "SSCC",
		recordType: "OP",
		from: 316,
		to: 333,
		type: "alpha",
		required: false
	},
	{
		key: "cartons",
		label: "Carton Quantity",
		recordType: "OP",
		from: 131,
		to: 135,
		type: "numeric",
		required: true
	},
	{
		key: "palletQuantity",
		label: "Pallet Quantity",
		recordType: "OP",
		from: 136,
		to: 144,
		type: "numeric",
		required: false
	},
	{
		key: "grossMass",
		label: "Pallet Gross Mass",
		recordType: "OP",
		from: 700,
		to: 709,
		type: "numeric",
		required: false
	},
	{
		key: "nettMass",
		label: "Nett Mass",
		recordType: "OP",
		from: 334,
		to: 342,
		type: "numeric",
		required: false
	},
	{
		key: "commodity",
		label: "Commodity",
		recordType: "OP",
		from: 80,
		to: 81,
		type: "alpha",
		required: false
	},
	{
		key: "variety",
		label: "Variety",
		recordType: "OP",
		from: 84,
		to: 86,
		type: "alpha",
		required: false
	},
	{
		key: "grade",
		label: "Grade",
		recordType: "OP",
		from: 97,
		to: 100,
		type: "alpha",
		required: false
	},
	{
		key: "pack",
		label: "Pack",
		recordType: "OP",
		from: 93,
		to: 96,
		type: "alpha",
		required: false
	},
	{
		key: "sizeCount",
		label: "Size Count",
		recordType: "OP",
		from: 106,
		to: 110,
		type: "alpha",
		required: false
	},
	{
		key: "mark",
		label: "Mark",
		recordType: "OP",
		from: 101,
		to: 105,
		type: "alpha",
		required: false
	},
	{
		key: "targetMarket",
		label: "Target Market",
		recordType: "OP",
		from: 129,
		to: 130,
		type: "alpha",
		required: false
	},
	{
		key: "country",
		label: "Country",
		recordType: "OP",
		from: 76,
		to: 77,
		type: "alpha",
		required: false
	},
	{
		key: "targetCountry",
		label: "Target Country",
		recordType: "OP",
		from: 534,
		to: 535,
		type: "alpha",
		required: false
	},
	{
		key: "farm",
		label: "Farm",
		recordType: "OP",
		from: 117,
		to: 123,
		type: "alpha",
		required: false
	},
	{
		key: "packhouseCode",
		label: "Packhouse Code",
		recordType: "OP",
		from: 451,
		to: 457,
		type: "alpha",
		required: false
	},
	{
		key: "orchard",
		label: "Orchard",
		recordType: "OP",
		from: 514,
		to: 528,
		type: "alpha",
		required: false
	},
	{
		key: "inspectionDate",
		label: "Inspection Date",
		recordType: "OP",
		from: 397,
		to: 404,
		type: "date",
		required: false
	},
	{
		key: "inspectionPoint",
		label: "Inspection Point",
		recordType: "OP",
		from: 498,
		to: 503,
		type: "alpha",
		required: false
	},
	{
		key: "inspector",
		label: "Inspector",
		recordType: "OP",
		from: 492,
		to: 497,
		type: "alpha",
		required: false
	},
	{
		key: "originalIntakeDate",
		label: "Original Intake Date",
		recordType: "OP",
		from: 173,
		to: 180,
		type: "date",
		required: false
	},
	{
		key: "season",
		label: "Season",
		recordType: "OP",
		from: 596,
		to: 599,
		type: "alpha",
		required: false
	},
	{
		key: "upn",
		label: "UPN",
		recordType: "OP",
		from: 645,
		to: 669,
		type: "alpha",
		required: false
	},
	{
		key: "phytoData",
		label: "Phyto Data",
		recordType: "OP",
		from: 758,
		to: 767,
		type: "alpha",
		required: false
	},
	{
		key: "productionArea",
		label: "Production Area",
		recordType: "OP",
		from: 742,
		to: 757,
		type: "alpha",
		required: false
	},
	{
		key: "inventoryCode",
		label: "Inventory Code",
		recordType: "OP",
		from: 111,
		to: 112,
		type: "alpha",
		required: false
	},
	{
		key: "commGrp",
		label: "Commercial Group",
		recordType: "OP",
		from: 78,
		to: 79,
		type: "alpha",
		required: false
	},
	{
		key: "varGrp",
		label: "Variety Group",
		recordType: "OP",
		from: 82,
		to: 83,
		type: "alpha",
		required: false
	},
	{
		key: "subVar",
		label: "Sub Variety",
		recordType: "OP",
		from: 87,
		to: 89,
		type: "alpha",
		required: false
	},
	{
		key: "actVar",
		label: "Actual Variety",
		recordType: "OP",
		from: 90,
		to: 92,
		type: "alpha",
		required: false
	},
	{
		key: "pickRef",
		label: "Pick Reference",
		recordType: "OP",
		from: 113,
		to: 116,
		type: "alpha",
		required: false
	},
	{
		key: "prodGrp",
		label: "Production Group",
		recordType: "OP",
		from: 124,
		to: 125,
		type: "alpha",
		required: false
	},
	{
		key: "prodChar",
		label: "Production Character",
		recordType: "OP",
		from: 126,
		to: 128,
		type: "alpha",
		required: false
	},
	{
		key: "remarks",
		label: "Remarks",
		recordType: "OP",
		from: 146,
		to: 153,
		type: "alpha",
		required: false
	},
	{
		key: "reason",
		label: "Reason",
		recordType: "OP",
		from: 154,
		to: 157,
		type: "alpha",
		required: false
	},
	{
		key: "shift",
		label: "Shift",
		recordType: "OP",
		from: 181,
		to: 181,
		type: "alpha",
		required: false
	},
	{
		key: "shiftDate",
		label: "Shift Date",
		recordType: "OP",
		from: 182,
		to: 189,
		type: "date",
		required: false
	},
	{
		key: "store",
		label: "Store",
		recordType: "OP",
		from: 203,
		to: 204,
		type: "alpha",
		required: false
	},
	{
		key: "stockPool",
		label: "Stock Pool",
		recordType: "OP",
		from: 205,
		to: 206,
		type: "alpha",
		required: false
	},
	{
		key: "shippedDate",
		label: "Shipped Date",
		recordType: "OP",
		from: 207,
		to: 219,
		type: "date",
		required: false
	},
	{
		key: "origCons",
		label: "Original Consignment",
		recordType: "OP",
		from: 255,
		to: 264,
		type: "alpha",
		required: false
	},
	{
		key: "shipNumber",
		label: "Ship Number",
		recordType: "OP",
		from: 265,
		to: 270,
		type: "alpha",
		required: false
	},
	{
		key: "temperature",
		label: "Temperature",
		recordType: "OP",
		from: 271,
		to: 276,
		type: "numeric",
		required: false
	},
	{
		key: "comboPalletId",
		label: "Combo Pallet ID",
		recordType: "OP",
		from: 277,
		to: 285,
		type: "alpha",
		required: false
	},
	{
		key: "tempDeviceId",
		label: "Temperature Device ID",
		recordType: "OP",
		from: 286,
		to: 305,
		type: "alpha",
		required: false
	},
	{
		key: "tempDeviceType",
		label: "Temperature Device Type",
		recordType: "OP",
		from: 306,
		to: 307,
		type: "alpha",
		required: false
	},
	{
		key: "boeNo",
		label: "BOE Number",
		recordType: "OP",
		from: 308,
		to: 313,
		type: "alpha",
		required: false
	},
	{
		key: "principal",
		label: "Principal",
		recordType: "OP",
		from: 314,
		to: 315,
		type: "alpha",
		required: false
	},
	{
		key: "saftbin1",
		label: "Saftbin 1",
		recordType: "OP",
		from: 343,
		to: 358,
		type: "alpha",
		required: false
	},
	{
		key: "saftbin2",
		label: "Saftbin 2",
		recordType: "OP",
		from: 359,
		to: 374,
		type: "alpha",
		required: false
	},
	{
		key: "saftbin3",
		label: "Saftbin 3",
		recordType: "OP",
		from: 375,
		to: 390,
		type: "alpha",
		required: false
	},
	{
		key: "origAccount",
		label: "Original Account",
		recordType: "OP",
		from: 391,
		to: 396,
		type: "alpha",
		required: false
	},
	{
		key: "stackVariance",
		label: "Stack Variance",
		recordType: "OP",
		from: 405,
		to: 405,
		type: "alpha",
		required: false
	},
	{
		key: "storeType",
		label: "Store Type",
		recordType: "OP",
		from: 406,
		to: 406,
		type: "alpha",
		required: false
	},
	{
		key: "batchNo",
		label: "Batch Number",
		recordType: "OP",
		from: 407,
		to: 426,
		type: "alpha",
		required: false
	},
	{
		key: "waybillNo",
		label: "Waybill Number",
		recordType: "OP",
		from: 427,
		to: 436,
		type: "alpha",
		required: false
	},
	{
		key: "gtin",
		label: "GTIN",
		recordType: "OP",
		from: 437,
		to: 450,
		type: "alpha",
		required: false
	},
	{
		key: "steriFlag",
		label: "Steri Flag",
		recordType: "OP",
		from: 458,
		to: 459,
		type: "alpha",
		required: false
	},
	{
		key: "steriDest",
		label: "Steri Destination",
		recordType: "OP",
		from: 460,
		to: 461,
		type: "alpha",
		required: false
	},
	{
		key: "labelType",
		label: "Label Type",
		recordType: "OP",
		from: 462,
		to: 462,
		type: "alpha",
		required: false
	},
	{
		key: "provFlag",
		label: "Provisional Flag",
		recordType: "OP",
		from: 463,
		to: 463,
		type: "alpha",
		required: false
	},
	{
		key: "sellbyCode",
		label: "Sell-By-Code",
		recordType: "OP",
		from: 464,
		to: 473,
		type: "alpha",
		required: false
	},
	{
		key: "comboSscc",
		label: "Combo SSCC",
		recordType: "OP",
		from: 474,
		to: 491,
		type: "alpha",
		required: false
	},
	{
		key: "expiryCode",
		label: "Expiry Code",
		recordType: "OP",
		from: 504,
		to: 513,
		type: "alpha",
		required: false
	},
	{
		key: "targetRegion",
		label: "Target Region",
		recordType: "OP",
		from: 529,
		to: 533,
		type: "alpha",
		required: false
	},
	{
		key: "globalGapNumber",
		label: "Global GAP Number",
		recordType: "OP",
		from: 536,
		to: 555,
		type: "alpha",
		required: false
	},
	{
		key: "lotNo",
		label: "Lot Number",
		recordType: "OP",
		from: 556,
		to: 575,
		type: "alpha",
		required: false
	},
	{
		key: "traceabilityCode",
		label: "Traceability Code",
		recordType: "OP",
		from: 576,
		to: 595,
		type: "alpha",
		required: false
	},
	{
		key: "origInspectionDate",
		label: "Original Inspection Date",
		recordType: "OP",
		from: 600,
		to: 607,
		type: "date",
		required: false
	},
	{
		key: "innerPack",
		label: "Inner Pack",
		recordType: "OP",
		from: 608,
		to: 617,
		type: "alpha",
		required: false
	},
	{
		key: "innerCartons",
		label: "Inner Cartons",
		recordType: "OP",
		from: 618,
		to: 622,
		type: "numeric",
		required: false
	},
	{
		key: "productionId",
		label: "Production ID",
		recordType: "OP",
		from: 623,
		to: 642,
		type: "alpha",
		required: false
	},
	{
		key: "protocolExceptionIndicator",
		label: "Protocol Exception Indicator",
		recordType: "OP",
		from: 643,
		to: 644,
		type: "alpha",
		required: false
	},
	{
		key: "custOrd",
		label: "Customer Order",
		recordType: "OP",
		from: 768,
		to: 807,
		type: "alpha",
		required: false
	},
	{
		key: "reInspectionDocument",
		label: "Re-Inspection Document",
		recordType: "OP",
		from: 808,
		to: 817,
		type: "alpha",
		required: false
	},
	{
		key: "agreementCode",
		label: "Agreement Code",
		recordType: "OP",
		from: 828,
		to: 837,
		type: "alpha",
		required: false
	},
	{
		key: "postTreatment",
		label: "Post Treatment",
		recordType: "OP",
		from: 838,
		to: 977,
		type: "alpha",
		required: false
	},
	{
		key: "referenceNumber",
		label: "Reference Number",
		recordType: "OP",
		from: 978,
		to: 997,
		type: "alpha",
		required: false
	},
	{
		key: "eLotKey",
		label: "eLot Key",
		recordType: "OP",
		from: 818,
		to: 827,
		type: "alpha",
		required: false
	},
	{
		key: "palletTreatment",
		label: "Pallet Treatment",
		recordType: "OP",
		from: 670,
		to: 699,
		type: "alpha",
		required: false
	},
	{
		key: "weighingLocation",
		label: "Weighing Location",
		recordType: "OP",
		from: 720,
		to: 726,
		type: "alpha",
		required: false
	},
	{
		key: "weighingDateTime",
		label: "Weighing Date Time",
		recordType: "OP",
		from: 727,
		to: 739,
		type: "date",
		required: false
	},
	{
		key: "mainArea",
		label: "Main Area",
		recordType: "OP",
		from: 740,
		to: 741,
		type: "alpha",
		required: false
	},
	{
		key: "actualGrade",
		label: "Actual Grade",
		recordType: "OP",
		from: 97,
		to: 100,
		type: "alpha",
		required: false
	},
	{
		key: "samsaAccreditation",
		label: "SAMSA Accreditation",
		recordType: "OP",
		from: 710,
		to: 719,
		type: "alpha",
		required: false
	}
];
/** Heuristic auto-mapping of Excel headers onto PO pallet fields. */
var SYNONYMS = {
	palletId: [
		"barcode",
		"pallet id",
		"palletid",
		"pallet no",
		"pallet number",
		"sscc/barcode",
		"pallet_id",
		"combo pallet id",
		"combo_pallet_id"
	],
	sscc: [
		"sscc",
		"sscc18",
		"sscc code",
		"combo sscc",
		"combo_sscc"
	],
	cartons: [
		"cartons",
		"carton qty",
		"carton quantity",
		"ctns",
		"quantity",
		"qty",
		"ctn qty",
		"ctn_qty"
	],
	palletQuantity: [
		"pallet qty",
		"pallet quantity",
		"pallets",
		"plt qty",
		"plt_qty",
		"calc plt qty",
		"calc plt qty"
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
		"calculated gross mass"
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
		"calculated net weight"
	],
	commodity: [
		"commodity",
		"commodity code",
		"product"
	],
	variety: [
		"variety",
		"variety code",
		"cultivar"
	],
	grade: ["grade", "class"],
	pack: [
		"pack",
		"pack code",
		"packaging"
	],
	sizeCount: [
		"count",
		"size",
		"size count",
		"size/count"
	],
	mark: ["mark", "brand"],
	targetMarket: [
		"target market",
		"market",
		"targ mkt",
		"targ_mkt"
	],
	country: [
		"country",
		"country of origin",
		"origin"
	],
	targetCountry: [
		"target country",
		"destination country",
		"target_country"
	],
	farm: [
		"farm",
		"farm code",
		"puc",
		"production unit"
	],
	packhouseCode: [
		"phc",
		"packhouse",
		"packhouse code",
		"packh code",
		"packh_code",
		"pack house code"
	],
	orchard: [
		"orchard",
		"orchard code",
		"block"
	],
	inspectionDate: [
		"inspection date",
		"insp date",
		"inspec date",
		"inspec_date",
		"orig inspec date",
		"orig_inspec_date"
	],
	inspectionPoint: [
		"inspection point",
		"insp point",
		"inspect pnt",
		"inspect_pnt"
	],
	inspector: ["inspector", "inspector code"],
	originalIntakeDate: [
		"original intake date",
		"intake date",
		"pack date",
		"packing date",
		"orig intake",
		"orig intake date",
		"orig_intake",
		"orig_intake_date"
	],
	season: ["season", "year"],
	upn: ["upn", "unique pallet number"],
	phytoData: [
		"phyto",
		"phyto data",
		"phytosanitary",
		"phyto_data"
	],
	productionArea: [
		"production area",
		"prod area",
		"area",
		"production_area"
	],
	inventoryCode: [
		"inventory",
		"inventory code",
		"inv code",
		"inv_code"
	],
	commGrp: [
		"comm_grp",
		"comm group",
		"commgrp"
	],
	varGrp: [
		"var_grp",
		"var variety",
		"variety group",
		"var grp"
	],
	subVar: ["sub_var", "sub var"],
	actVar: [
		"act_var",
		"act var",
		"actual variety"
	],
	pickRef: [
		"pick_ref",
		"pick ref",
		"pick reference"
	],
	prodGrp: [
		"prod_grp",
		"prod group",
		"production group"
	],
	prodChar: [
		"prod_char",
		"prod char",
		"production char"
	],
	remarks: ["remarks"],
	reason: ["reason"],
	shift: ["shift"],
	shiftDate: ["shift_date", "shift date"],
	store: ["store"],
	stockPool: ["stock_pool", "stock pool"],
	shippedDate: [
		"shipped_date",
		"shipped date",
		"load out date"
	],
	origCons: [
		"orig_cons",
		"orig cons",
		"original consignment"
	],
	shipNumber: [
		"ship number",
		"ship_no",
		"ship no"
	],
	temperature: ["temperature", "temp"],
	comboPalletId: ["combo_pallet_id", "combo pallet id"],
	tempDeviceId: [
		"temp_device_id",
		"temp device id",
		"temperature device id"
	],
	tempDeviceType: [
		"temp_device_type",
		"temp device type",
		"temperature device type"
	],
	boeNo: [
		"boe_no",
		"boe no",
		"boe"
	],
	principal: ["principal"],
	saftbin1: ["saftbin1", "saft bin1"],
	saftbin2: ["saftbin2", "saft bin2"],
	saftbin3: ["saftbin3", "saft bin3"],
	origAccount: [
		"orig_account",
		"orig account",
		"original account"
	],
	stackVariance: ["stack_variance", "stack variance"],
	storeType: ["store_type", "store type"],
	batchNo: ["batch_no", "batch no"],
	waybillNo: ["waybill_no", "waybill no"],
	gtin: ["gtin"],
	steriFlag: ["steri_flag", "steri flag"],
	steriDest: ["steri_dest", "steri dest"],
	labelType: ["label_type", "label type"],
	provFlag: [
		"prov flag",
		"prov_flag",
		"provisional flag"
	],
	sellbyCode: [
		"sellbycode",
		"sellby code",
		"sellby_code"
	],
	comboSscc: ["combo_sscc", "combo sscc"],
	expiryCode: [
		"expiry_code",
		"expiry code",
		"expirycode"
	],
	targetRegion: ["target_region", "target region"],
	globalGapNumber: ["global_gap_number", "global gap number"],
	lotNo: [
		"lot no",
		"lot_no",
		"lot number"
	],
	traceabilityCode: ["traceability_code", "traceability code"],
	origInspectionDate: [
		"orig_inspec_date",
		"orig inspection date",
		"original inspection date"
	],
	innerPack: ["inner_pack", "inner pack"],
	innerCartons: ["inner_cartons", "inner cartons"],
	productionId: ["production_id", "production id"],
	protocolExceptionIndicator: ["protocol_exception_indicator", "protocol exception indicator"],
	custOrd: [
		"cust_ord",
		"cust ord",
		"customer order"
	],
	reInspectionDocument: [
		"re_inspec_doc",
		"re inspection doc",
		"reinspection document"
	],
	agreementCode: ["agreement code", "agreement_code"],
	postTreatment: ["post treatment", "post_treatment"],
	referenceNumber: [
		"reference no",
		"reference number",
		"reference_no"
	],
	eLotKey: [
		"e lot key",
		"e lot",
		"e lot key old",
		"eLot_Key"
	],
	palletTreatment: ["pallet_treatment", "pallet treatment"],
	weighingLocation: ["weighing location", "weighing_location"],
	weighingDateTime: [
		"weighing date time",
		"weighing datetime",
		"weighing_date_time"
	],
	mainArea: ["main area", "main_area"],
	actualGrade: ["actual_grade", "actual grade"],
	samsaAccreditation: [
		"samsa accreditation",
		"samsa accredit pallet",
		"samsaaccredit pallet",
		"samsaaccredit"
	]
};
var norm = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
function suggestMapping(headers) {
	const mapping = {};
	const used = /* @__PURE__ */ new Set();
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
var HEADER_SYNONYMS = { containerNumber: [
	"container number",
	"container no",
	"container",
	"cntr no"
] };
function suggestHeaderValues(headers, previewRows) {
	const suggested = {};
	const norm = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
	const preferredRow = previewRows.find((row) => Object.values(row).some((v) => v.trim().length > 0));
	for (const field of Object.keys(HEADER_SYNONYMS)) {
		const candidates = HEADER_SYNONYMS[field] ?? [];
		const match = headers.find((h) => candidates.some((c) => norm(h) === norm(c))) ?? headers.find((h) => candidates.some((c) => norm(h).includes(norm(c)) || norm(c).includes(norm(h))));
		if (match && preferredRow) {
			const value = String(preferredRow[match] ?? "").trim();
			if (value) suggested[field] = value;
		}
	}
	return suggested;
}
function resolveBackendMapping(headers, mapping) {
	const effectiveMapping = { ...mapping };
	const hardCodedHeader = "Barcode";
	const matchingHeader = headers.find((header) => header.toLowerCase() === hardCodedHeader.toLowerCase());
	if (matchingHeader) effectiveMapping.palletId = matchingHeader;
	return effectiveMapping;
}
function getMappingOptionLabel(header, fieldKey) {
	const label = (fieldKey ? PALLET_FIELDS.find((entry) => entry.key === fieldKey) : void 0)?.label;
	if (!label || header === label) return header;
	return `${header} — ${label}`;
}
function applyMapping(rows, mapping, headers, firstDataRowNumber = 2) {
	const resolvedMapping = resolveBackendMapping(headers, mapping);
	return rows.map((raw, index) => ({
		excelRow: firstDataRowNumber + index,
		values: Object.fromEntries(Object.entries(resolvedMapping).filter(([, header]) => !!header).map(([key, header]) => [key, raw[header]]))
	}));
}
//#endregion
export { suggestMapping as a, suggestHeaderValues as i, applyMapping as n, getMappingOptionLabel as r, PALLET_FIELDS as t };
