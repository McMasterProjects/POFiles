import { n as deleteMappingProfileFn, s as listMappingProfilesFn } from "./conversion.functions-CvmzUFl_.mjs";
import { i as require_jsx_runtime, r as useQueryClient, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { o as PageTitle, t as AppShell } from "./shell-CaMCdGB4.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mapping-profiles-C2fWjgd2.js
var import_jsx_runtime = require_jsx_runtime();
function MappingProfiles() {
	const qc = useQueryClient();
	const { data = [] } = useQuery({
		queryKey: ["profiles"],
		queryFn: () => listMappingProfilesFn()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
		title: "Mapping Profiles",
		subtitle: "Saved from the Column Mapping FastTab on the conversion page."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "bc-card overflow-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full border-collapse text-[12px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-secondary text-left",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
					"Name",
					"Mapped Fields",
					"Created",
					""
				].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "border-r border-border px-2 py-1",
					children: h
				}, h)) })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [data.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: p.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: Object.keys(p.mapping).length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-r border-border px-2 py-1",
						children: new Date(p.createdAt).toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-2 py-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "text-destructive hover:underline",
							onClick: async () => {
								await deleteMappingProfileFn({ data: { id: p.id } });
								await qc.invalidateQueries({ queryKey: ["profiles"] });
								toast.success("Profile deleted");
							},
							children: "Delete"
						})
					})
				]
			}, p.id)), !data.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-2 text-muted-foreground",
				colSpan: 4,
				children: "No mapping profiles saved."
			}) }) : null] })]
		})
	})] });
}
//#endregion
export { MappingProfiles as component };
