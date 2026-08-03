import { a as listConversionsFn, i as healthFn } from "./conversion.functions-CvmzUFl_.mjs";
import { i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { o as PageTitle, s as StatusIndicator, t as AppShell } from "./shell-CaMCdGB4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-BjKy0qMd.js
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const { data = [] } = useQuery({
		queryKey: ["conversions"],
		queryFn: () => listConversionsFn()
	});
	const { data: health } = useQuery({
		queryKey: ["health"],
		queryFn: () => healthFn()
	});
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const todays = data.filter((c) => c.createdAt.startsWith(today));
	const ok = data.filter((c) => c.status === "Completed");
	const failed = data.filter((c) => c.status !== "Completed");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
			title: "Dashboard",
			subtitle: `Backend ${health?.status ?? "…"} · v${health?.version ?? "-"}`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
					label: "Conversions today",
					value: todays.length
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
					label: "Successful",
					value: ok.length
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
					label: "Failed",
					value: failed.length
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
					label: "Awaiting validation",
					value: data.filter((c) => c.status === "Validation Failed").length
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
					label: "Pallet records",
					value: data.reduce((s, c) => s + c.palletCount, 0)
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bc-card mt-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border px-3 py-2 text-[13px] font-semibold text-heading",
				children: "Recent conversions"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full border-collapse text-[12px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-secondary text-left",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-1",
							children: "Conversion ID"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-1",
							children: "Source"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-1",
							children: "Output"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-1",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-1",
							children: "Pallets"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-1",
							children: "Cartons"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [data.slice(0, 10).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1",
							children: c.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1",
							children: c.sourceFileName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1",
							children: c.outputFileName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIndicator, {
								kind: c.status === "Completed" ? "valid" : "error",
								label: c.status
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1",
							children: c.palletCount
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1",
							children: c.cartonCount
						})
					]
				}, c.id)), !data.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-2 py-2 text-muted-foreground",
					colSpan: 6,
					children: "No conversions yet."
				}) }) : null] })]
			})]
		})
	] });
}
function Tile({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bc-card p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "bc-label",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xl font-semibold text-heading",
			children: value
		})]
	});
}
//#endregion
export { Dashboard as component };
