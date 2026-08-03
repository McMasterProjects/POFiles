//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-DGbocLh9.js
var manifest = {
	"12a660218852012ad590c537a73534266aa537131ad92d023b8ff0bb008a096f": {
		functionName: "deleteMappingProfileFn_createServerFn_handler",
		importer: () => import("./_ssr/conversion.functions-WHCgIgAN.mjs")
	},
	"4fe258aadf2569f51023cb97b19447bed4b447a73675bc815a7d24983259ac26": {
		functionName: "saveMappingProfileFn_createServerFn_handler",
		importer: () => import("./_ssr/conversion.functions-WHCgIgAN.mjs")
	},
	"5ebe023964926727a1f32279f21ad99ee033f77165b98135c11b9bb227f63746": {
		functionName: "selectSheetFn_createServerFn_handler",
		importer: () => import("./_ssr/conversion.functions-WHCgIgAN.mjs")
	},
	"640c792476ecc8542286c9cd4dab4cff883e7b83284f68ea00d9c632b70566b7": {
		functionName: "uploadExcelFn_createServerFn_handler",
		importer: () => import("./_ssr/conversion.functions-WHCgIgAN.mjs")
	},
	"70c75840736ccd5c366781836fafbaa67647703d6cef9fc4062e3130b0bb1057": {
		functionName: "listLogsFn_createServerFn_handler",
		importer: () => import("./_ssr/conversion.functions-WHCgIgAN.mjs")
	},
	"8583195a6ae99b4b1f09c98347031cf24d16002d0cd30a4dbca05d6355ed4e33": {
		functionName: "generateConversionFn_createServerFn_handler",
		importer: () => import("./_ssr/conversion.functions-WHCgIgAN.mjs")
	},
	"8e05756923503430dade1f15cd93a31a17a176e64619e952dcbba48e2e6c28b3": {
		functionName: "getConversionPreviewFn_createServerFn_handler",
		importer: () => import("./_ssr/conversion.functions-WHCgIgAN.mjs")
	},
	"9eb7b9e9d723fb2276969a26cc7b824da4ec4564e6c464804de1bb6c97e1a1dc": {
		functionName: "listMappingProfilesFn_createServerFn_handler",
		importer: () => import("./_ssr/conversion.functions-WHCgIgAN.mjs")
	},
	"a2f0af07b1c5ea9174f15f7cb08330130062af743eaca35530cfc9bb6ca1a66c": {
		functionName: "healthFn_createServerFn_handler",
		importer: () => import("./_ssr/conversion.functions-WHCgIgAN.mjs")
	},
	"a7008f3466c13969ed48caf12d818cb47ef3cbc23fd9fd43f1b878a88477e01a": {
		functionName: "validateConversionFn_createServerFn_handler",
		importer: () => import("./_ssr/conversion.functions-WHCgIgAN.mjs")
	},
	"b4fd3e765420decd587511be12ca927f0a03984f15903a42d0251f8f0fe744a8": {
		functionName: "listConversionsFn_createServerFn_handler",
		importer: () => import("./_ssr/conversion.functions-WHCgIgAN.mjs")
	},
	"de24995c25e3f7f8f32110aaade71321f40829c9edc72f8bf920fff94bb29701": {
		functionName: "getConversionReportFn_createServerFn_handler",
		importer: () => import("./_ssr/conversion.functions-WHCgIgAN.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
