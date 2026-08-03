//#region node_modules/.nitro/vite/services/ssr/assets/store.server-DSi65Utv.js
var g = globalThis;
var created = g.__poStore ?? {
	uploads: /* @__PURE__ */ new Map(),
	conversions: /* @__PURE__ */ new Map(),
	logs: [],
	profiles: /* @__PURE__ */ new Map()
};
g.__poStore = created;
var store = created;
function pushLogs(entries) {
	store.logs.push(...entries);
	if (store.logs.length > 5e3) store.logs.splice(0, store.logs.length - 5e3);
}
function logEvent(conversionId, module, action, extra = {}) {
	pushLogs([{
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		level: "info",
		conversionId,
		module,
		action,
		...extra
	}]);
}
function newId(prefix) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}
//#endregion
export { logEvent, newId, pushLogs, store };
