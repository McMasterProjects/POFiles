import { a as listConversionsFn } from "./conversion.functions-CvmzUFl_.mjs";
import { i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { o as PageTitle, s as StatusIndicator, t as AppShell } from "./shell-CaMCdGB4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-UjENzRsr.js
var import_jsx_runtime = require_jsx_runtime();
function History() {
	const { data = [] } = useQuery({
		queryKey: ["conversions"],
		queryFn: () => listConversionsFn()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, { title: "Conversion History" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "bc-card overflow-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full border-collapse text-[12px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-secondary text-left",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
					"Conversion ID",
					"Source File",
					"Output File",
					"Status",
					"Pallets",
					"Cartons",
					"Errors",
					"Created",
					"Completed"
				].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "border-r border-border px-2 py-1 whitespace-nowrap",
					children: h
				}, h)) })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [data.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: c.id
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: c.sourceFileName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: c.outputFileName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIndicator, {
							kind: c.status === "Completed" ? "valid" : "error",
							label: c.status
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: c.palletCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: c.cartonCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: c.errors.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: new Date(c.createdAt).toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-2 py-1",
						children: c.completedAt ? new Date(c.completedAt).toLocaleString() : "—"
					})
				]
			}, c.id)), !data.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-2 text-muted-foreground",
				colSpan: 9,
				children: "No conversions recorded."
			}) }) : null] })]
		})
	})] });
}
//#endregion
export { History as component };
