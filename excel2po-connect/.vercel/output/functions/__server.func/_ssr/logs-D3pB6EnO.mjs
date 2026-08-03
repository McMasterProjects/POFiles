import { i as __toESM } from "../_runtime.mjs";
import { o as listLogsFn } from "./conversion.functions-CvmzUFl_.mjs";
import { a as require_react, i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { o as PageTitle, t as AppShell } from "./shell-CaMCdGB4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/logs-D3pB6EnO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Logs() {
	const { data = [], refetch } = useQuery({
		queryKey: ["logs"],
		queryFn: () => listLogsFn()
	});
	const [filter, setFilter] = (0, import_react.useState)("");
	const rows = data.filter((l) => filter ? `${l.conversionId} ${l.level} ${l.module} ${l.action} ${l.message ?? ""}`.toLowerCase().includes(filter.toLowerCase()) : true);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
			title: "System Logs",
			subtitle: `${rows.length} entries`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "bc-input max-w-xs",
				placeholder: "Filter by conversion ID, level, module or message",
				value: filter,
				onChange: (e) => setFilter(e.target.value)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "rounded-[2px] border border-input px-2 py-1 text-[12px] hover:bg-accent",
				onClick: () => refetch(),
				children: "Refresh"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "bc-card max-h-[70vh] overflow-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full border-collapse text-[12px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "sticky top-0 bg-secondary text-left",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
						"Timestamp",
						"Level",
						"Conversion ID",
						"Module",
						"Action",
						"Row",
						"Field",
						"Message"
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "border-r border-border px-2 py-1 whitespace-nowrap",
						children: h
					}, h)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [rows.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-r border-border px-2 py-1 whitespace-nowrap",
							children: l.timestamp
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-r border-border px-2 py-1",
							children: l.level
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-r border-border px-2 py-1",
							children: l.conversionId
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-r border-border px-2 py-1",
							children: l.module
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-r border-border px-2 py-1",
							children: l.action
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-r border-border px-2 py-1",
							children: l.excelRow ?? ""
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-r border-border px-2 py-1",
							children: l.field ?? ""
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1",
							children: l.message ?? ""
						})
					]
				}, i)), !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-2 py-2 text-muted-foreground",
					colSpan: 8,
					children: "No log entries."
				}) }) : null] })]
			})
		})
	] });
}
//#endregion
export { Logs as component };
