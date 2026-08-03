import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { a as stringType, i as recordType, n as numberType, r as objectType, t as booleanType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversion.functions-WHCgIgAN.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var headerSchema = objectType({
	sourceAddress: stringType().min(1).max(3),
	destinationAddress: stringType().max(3).default("000"),
	sequenceNumber: stringType().max(10).default(""),
	batchNumber: stringType().max(10).default("0"),
	loadId: stringType().max(10).optional(),
	loadReference: stringType().max(10).optional(),
	locationCode: stringType().max(7).default(""),
	containerNumber: stringType().max(11).default(""),
	sealNumber: stringType().max(15).default(""),
	consignmentNumber: stringType().max(10).default(""),
	organisationCode: stringType().max(2).default(""),
	countryCode: stringType().max(2).default("ZA"),
	channel: stringType().max(1).default("E"),
	destinationType: stringType().max(2).default("DP"),
	destinationLocation: stringType().max(7).default(""),
	stuffingDate: stringType().max(8).optional(),
	transactionDate: stringType().max(8).optional(),
	transactionTime: stringType().max(5).optional(),
	provider: stringType().max(30).default("MATES"),
	version: stringType().max(30).default("2.18"),
	fileName: stringType().max(60).optional()
});
var conversionInput = objectType({
	uploadId: stringType().min(1),
	sheetName: stringType().min(1),
	mapping: recordType(stringType(), stringType().optional()),
	header: headerSchema,
	treatWarningsAsErrors: booleanType().optional()
});
var uploadExcelFn_createServerFn_handler = createServerRpc({
	id: "640c792476ecc8542286c9cd4dab4cff883e7b83284f68ea00d9c632b70566b7",
	name: "uploadExcelFn",
	filename: "src/lib/po/conversion.functions.ts"
}, (opts) => uploadExcelFn.__executeServer(opts));
var uploadExcelFn = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	fileName: stringType().min(1).max(200),
	fileSize: numberType().int().positive(),
	base64: stringType().min(1)
}).parse(data)).handler(uploadExcelFn_createServerFn_handler, async ({ data }) => {
	const { handleUpload } = await import("./service.server-Dr1gz_9w.mjs");
	return handleUpload(data);
});
var selectSheetFn_createServerFn_handler = createServerRpc({
	id: "5ebe023964926727a1f32279f21ad99ee033f77165b98135c11b9bb227f63746",
	name: "selectSheetFn",
	filename: "src/lib/po/conversion.functions.ts"
}, (opts) => selectSheetFn.__executeServer(opts));
var selectSheetFn = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	uploadId: stringType(),
	sheetName: stringType()
}).parse(data)).handler(selectSheetFn_createServerFn_handler, async ({ data }) => {
	const { inspectSheet } = await import("./service.server-Dr1gz_9w.mjs");
	return inspectSheet(data.uploadId, data.sheetName);
});
var validateConversionFn_createServerFn_handler = createServerRpc({
	id: "a7008f3466c13969ed48caf12d818cb47ef3cbc23fd9fd43f1b878a88477e01a",
	name: "validateConversionFn",
	filename: "src/lib/po/conversion.functions.ts"
}, (opts) => validateConversionFn.__executeServer(opts));
var validateConversionFn = createServerFn({ method: "POST" }).inputValidator((data) => conversionInput.parse(data)).handler(validateConversionFn_createServerFn_handler, async ({ data }) => {
	const { runConversion } = await import("./service.server-Dr1gz_9w.mjs");
	return runConversion({
		uploadId: data.uploadId,
		sheetName: data.sheetName,
		mapping: data.mapping,
		header: data.header,
		persist: false,
		treatWarningsAsErrors: data.treatWarningsAsErrors
	});
});
var generateConversionFn_createServerFn_handler = createServerRpc({
	id: "8583195a6ae99b4b1f09c98347031cf24d16002d0cd30a4dbca05d6355ed4e33",
	name: "generateConversionFn",
	filename: "src/lib/po/conversion.functions.ts"
}, (opts) => generateConversionFn.__executeServer(opts));
var generateConversionFn = createServerFn({ method: "POST" }).inputValidator((data) => conversionInput.parse(data)).handler(generateConversionFn_createServerFn_handler, async ({ data }) => {
	const { runConversion } = await import("./service.server-Dr1gz_9w.mjs");
	return runConversion({
		uploadId: data.uploadId,
		sheetName: data.sheetName,
		mapping: data.mapping,
		header: data.header,
		persist: true,
		treatWarningsAsErrors: data.treatWarningsAsErrors
	});
});
var getConversionPreviewFn_createServerFn_handler = createServerRpc({
	id: "8e05756923503430dade1f15cd93a31a17a176e64619e952dcbba48e2e6c28b3",
	name: "getConversionPreviewFn",
	filename: "src/lib/po/conversion.functions.ts"
}, (opts) => getConversionPreviewFn.__executeServer(opts));
var getConversionPreviewFn = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ id: stringType() }).parse(data)).handler(getConversionPreviewFn_createServerFn_handler, async ({ data }) => {
	const { requireConversion } = await import("./service.server-Dr1gz_9w.mjs");
	const c = requireConversion(data.id);
	return {
		fileName: c.outputFileName,
		content: c.content
	};
});
var getConversionReportFn_createServerFn_handler = createServerRpc({
	id: "de24995c25e3f7f8f32110aaade71321f40829c9edc72f8bf920fff94bb29701",
	name: "getConversionReportFn",
	filename: "src/lib/po/conversion.functions.ts"
}, (opts) => getConversionReportFn.__executeServer(opts));
var getConversionReportFn = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ id: stringType() }).parse(data)).handler(getConversionReportFn_createServerFn_handler, async ({ data }) => {
	const { buildValidationReport } = await import("./service.server-Dr1gz_9w.mjs");
	return buildValidationReport(data.id);
});
var listConversionsFn_createServerFn_handler = createServerRpc({
	id: "b4fd3e765420decd587511be12ca927f0a03984f15903a42d0251f8f0fe744a8",
	name: "listConversionsFn",
	filename: "src/lib/po/conversion.functions.ts"
}, (opts) => listConversionsFn.__executeServer(opts));
var listConversionsFn = createServerFn({ method: "GET" }).handler(listConversionsFn_createServerFn_handler, async () => {
	const { store } = await import("./store.server-DSi65Utv.mjs");
	return [...store.conversions.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(({ content: _content, ...rest }) => rest);
});
var listLogsFn_createServerFn_handler = createServerRpc({
	id: "70c75840736ccd5c366781836fafbaa67647703d6cef9fc4062e3130b0bb1057",
	name: "listLogsFn",
	filename: "src/lib/po/conversion.functions.ts"
}, (opts) => listLogsFn.__executeServer(opts));
var listLogsFn = createServerFn({ method: "GET" }).handler(listLogsFn_createServerFn_handler, async () => {
	const { store } = await import("./store.server-DSi65Utv.mjs");
	return store.logs.slice(-1e3).reverse();
});
var listMappingProfilesFn_createServerFn_handler = createServerRpc({
	id: "9eb7b9e9d723fb2276969a26cc7b824da4ec4564e6c464804de1bb6c97e1a1dc",
	name: "listMappingProfilesFn",
	filename: "src/lib/po/conversion.functions.ts"
}, (opts) => listMappingProfilesFn.__executeServer(opts));
var listMappingProfilesFn = createServerFn({ method: "GET" }).handler(listMappingProfilesFn_createServerFn_handler, async () => {
	const { store } = await import("./store.server-DSi65Utv.mjs");
	return [...store.profiles.values()];
});
var saveMappingProfileFn_createServerFn_handler = createServerRpc({
	id: "4fe258aadf2569f51023cb97b19447bed4b447a73675bc815a7d24983259ac26",
	name: "saveMappingProfileFn",
	filename: "src/lib/po/conversion.functions.ts"
}, (opts) => saveMappingProfileFn.__executeServer(opts));
var saveMappingProfileFn = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	name: stringType().min(1).max(60),
	mapping: recordType(stringType(), stringType().optional())
}).parse(data)).handler(saveMappingProfileFn_createServerFn_handler, async ({ data }) => {
	const { store, newId } = await import("./store.server-DSi65Utv.mjs");
	const profile = {
		id: newId("MAP"),
		name: data.name,
		mapping: data.mapping,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	store.profiles.set(profile.id, profile);
	return profile;
});
var deleteMappingProfileFn_createServerFn_handler = createServerRpc({
	id: "12a660218852012ad590c537a73534266aa537131ad92d023b8ff0bb008a096f",
	name: "deleteMappingProfileFn",
	filename: "src/lib/po/conversion.functions.ts"
}, (opts) => deleteMappingProfileFn.__executeServer(opts));
var deleteMappingProfileFn = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ id: stringType() }).parse(data)).handler(deleteMappingProfileFn_createServerFn_handler, async ({ data }) => {
	const { store } = await import("./store.server-DSi65Utv.mjs");
	store.profiles.delete(data.id);
	return { ok: true };
});
var healthFn_createServerFn_handler = createServerRpc({
	id: "a2f0af07b1c5ea9174f15f7cb08330130062af743eaca35530cfc9bb6ca1a66c",
	name: "healthFn",
	filename: "src/lib/po/conversion.functions.ts"
}, (opts) => healthFn.__executeServer(opts));
var healthFn = createServerFn({ method: "GET" }).handler(healthFn_createServerFn_handler, async () => {
	const { store } = await import("./store.server-DSi65Utv.mjs");
	return {
		status: "ok",
		version: "1.0.0",
		conversions: store.conversions.size,
		uploads: store.uploads.size,
		time: (/* @__PURE__ */ new Date()).toISOString()
	};
});
//#endregion
export { deleteMappingProfileFn_createServerFn_handler, generateConversionFn_createServerFn_handler, getConversionPreviewFn_createServerFn_handler, getConversionReportFn_createServerFn_handler, healthFn_createServerFn_handler, listConversionsFn_createServerFn_handler, listLogsFn_createServerFn_handler, listMappingProfilesFn_createServerFn_handler, saveMappingProfileFn_createServerFn_handler, selectSheetFn_createServerFn_handler, uploadExcelFn_createServerFn_handler, validateConversionFn_createServerFn_handler };
