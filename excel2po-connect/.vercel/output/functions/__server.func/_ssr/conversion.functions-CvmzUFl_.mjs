import { n as __exportAll$1 } from "../_runtime.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-DGbocLh9.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { a as stringType, i as recordType, n as numberType, r as objectType, t as booleanType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversion.functions-CvmzUFl_.js
var conversion_functions_CvmzUFl__exports = /* @__PURE__ */ __exportAll$1({
	a: () => listConversionsFn,
	c: () => saveMappingProfileFn,
	d: () => validateConversionFn,
	i: () => healthFn,
	l: () => selectSheetFn,
	n: () => deleteMappingProfileFn,
	o: () => listLogsFn,
	r: () => generateConversionFn,
	s: () => listMappingProfilesFn,
	t: () => conversion_functions_exports,
	u: () => uploadExcelFn
});
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var conversion_functions_exports = /* @__PURE__ */ __exportAll({
	deleteMappingProfileFn: () => deleteMappingProfileFn,
	generateConversionFn: () => generateConversionFn,
	getConversionPreviewFn: () => getConversionPreviewFn,
	getConversionReportFn: () => getConversionReportFn,
	healthFn: () => healthFn,
	listConversionsFn: () => listConversionsFn,
	listLogsFn: () => listLogsFn,
	listMappingProfilesFn: () => listMappingProfilesFn,
	saveMappingProfileFn: () => saveMappingProfileFn,
	selectSheetFn: () => selectSheetFn,
	uploadExcelFn: () => uploadExcelFn,
	validateConversionFn: () => validateConversionFn
});
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
var uploadExcelFn = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	fileName: stringType().min(1).max(200),
	fileSize: numberType().int().positive(),
	base64: stringType().min(1)
}).parse(data)).handler(createSsrRpc("640c792476ecc8542286c9cd4dab4cff883e7b83284f68ea00d9c632b70566b7"));
var selectSheetFn = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	uploadId: stringType(),
	sheetName: stringType()
}).parse(data)).handler(createSsrRpc("5ebe023964926727a1f32279f21ad99ee033f77165b98135c11b9bb227f63746"));
var validateConversionFn = createServerFn({ method: "POST" }).inputValidator((data) => conversionInput.parse(data)).handler(createSsrRpc("a7008f3466c13969ed48caf12d818cb47ef3cbc23fd9fd43f1b878a88477e01a"));
var generateConversionFn = createServerFn({ method: "POST" }).inputValidator((data) => conversionInput.parse(data)).handler(createSsrRpc("8583195a6ae99b4b1f09c98347031cf24d16002d0cd30a4dbca05d6355ed4e33"));
var getConversionPreviewFn = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ id: stringType() }).parse(data)).handler(createSsrRpc("8e05756923503430dade1f15cd93a31a17a176e64619e952dcbba48e2e6c28b3"));
var getConversionReportFn = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ id: stringType() }).parse(data)).handler(createSsrRpc("de24995c25e3f7f8f32110aaade71321f40829c9edc72f8bf920fff94bb29701"));
var listConversionsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("b4fd3e765420decd587511be12ca927f0a03984f15903a42d0251f8f0fe744a8"));
var listLogsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("70c75840736ccd5c366781836fafbaa67647703d6cef9fc4062e3130b0bb1057"));
var listMappingProfilesFn = createServerFn({ method: "GET" }).handler(createSsrRpc("9eb7b9e9d723fb2276969a26cc7b824da4ec4564e6c464804de1bb6c97e1a1dc"));
var saveMappingProfileFn = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	name: stringType().min(1).max(60),
	mapping: recordType(stringType(), stringType().optional())
}).parse(data)).handler(createSsrRpc("4fe258aadf2569f51023cb97b19447bed4b447a73675bc815a7d24983259ac26"));
var deleteMappingProfileFn = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ id: stringType() }).parse(data)).handler(createSsrRpc("12a660218852012ad590c537a73534266aa537131ad92d023b8ff0bb008a096f"));
var healthFn = createServerFn({ method: "GET" }).handler(createSsrRpc("a2f0af07b1c5ea9174f15f7cb08330130062af743eaca35530cfc9bb6ca1a66c"));
//#endregion
export { listConversionsFn as a, saveMappingProfileFn as c, validateConversionFn as d, healthFn as i, selectSheetFn as l, deleteMappingProfileFn as n, listLogsFn as o, generateConversionFn as r, listMappingProfilesFn as s, conversion_functions_CvmzUFl__exports as t, uploadExcelFn as u };
