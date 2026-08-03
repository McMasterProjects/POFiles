import { a as listConversionsFn } from "./conversion.functions-CvmzUFl_.mjs";
import { i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { o as PageTitle, s as StatusIndicator, t as AppShell } from "./shell-CaMCdGB4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/validation-errors-DA67we_o.js
var import_jsx_runtime = require_jsx_runtime();
function ValidationErrors() {
	const { data = [] } = useQuery({
		queryKey: ["conversions"],
		queryFn: () => listConversionsFn()
	});
	const rows = data.flatMap((c) => [...c.errors, ...c.warnings].map((issue) => ({
		conversionId: c.id,
		...issue
	})));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
		title: "Validation Errors",
		subtitle: `${rows.length} recorded issue(s)`
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "bc-card overflow-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full border-collapse text-[12px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-secondary text-left",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
					"Severity",
					"Conversion",
					"Excel Row",
					"Record",
					"Field",
					"Code",
					"Positions",
					"Value",
					"Message"
				].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "border-r border-border px-2 py-1 whitespace-nowrap",
					children: h
				}, h)) })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIndicator, {
							kind: r.severity === "error" ? "error" : "warning",
							label: r.severity
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: r.conversionId
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: r.excelRow ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: r.recordType ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: r.field ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: r.code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: r.fromPosition ? `${r.fromPosition}–${r.toPosition}` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: r.value ?? ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-2 py-1",
						children: r.message
					})
				]
			}, i)), !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-2 text-muted-foreground",
				colSpan: 9,
				children: "No validation issues recorded."
			}) }) : null] })]
		})
	})] });
}
//#endregion
export { ValidationErrors as component };
