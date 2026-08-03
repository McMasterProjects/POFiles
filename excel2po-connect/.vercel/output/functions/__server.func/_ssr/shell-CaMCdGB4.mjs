import { g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { i as ScrollText, l as FileSpreadsheet, n as TriangleAlert, o as LayoutDashboard, p as Columns3, r as Settings, s as History } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-CaMCdGB4.js
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/",
		label: "Convert Excel",
		icon: FileSpreadsheet
	},
	{
		to: "/mapping-profiles",
		label: "Mapping Profiles",
		icon: Columns3
	},
	{
		to: "/history",
		label: "Conversion History",
		icon: History
	},
	{
		to: "/validation-errors",
		label: "Validation Errors",
		icon: TriangleAlert
	},
	{
		to: "/logs",
		label: "System Logs",
		icon: ScrollText
	},
	{
		to: "/settings",
		label: "Settings",
		icon: Settings
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isActiveRoute = (to) => {
		if (to === "/") return pathname === "/";
		return pathname === to || pathname.startsWith(`${to}/`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex w-56 shrink-0 flex-col bg-nav text-nav-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-11 items-center gap-2 border-b border-sidebar-border px-3 text-[13px] font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4" }), "Excel to PO Converter"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex-1 py-1",
					children: NAV.map((item) => {
						const active = isActiveRoute(item.to);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: `flex items-center gap-2 border-l-2 px-3 py-1.5 text-[13px] transition-colors ${active ? "border-l-primary bg-sidebar-accent font-semibold" : "border-l-transparent hover:bg-sidebar-accent/60"}`,
							"aria-current": active ? "page" : void 0,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5 opacity-80" }), item.label]
						}, item.to);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-sidebar-border px-3 py-2 text-[11px] opacity-70",
					children: "Mates PO v2.18"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-11 items-center justify-between border-b border-border bg-card px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[13px] font-semibold text-heading",
					children: "Operations · Paltrack Transmissions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[12px] text-muted-foreground",
					children: "Internal utility"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "min-w-0 flex-1 p-4",
				children
			})]
		})]
	});
}
function CommandBar({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap items-center gap-1 border border-border bg-commandbar px-2 py-1",
		children
	});
}
function CommandButton({ onClick, disabled, icon: Icon, children, primary }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		disabled,
		className: `inline-flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 text-[12.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${primary ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-foreground hover:bg-accent"}`,
		children: [Icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5" }) : null, children]
	});
}
function PageTitle({ title, subtitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "bc-page-title",
			children: title
		}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[12px] text-muted-foreground",
			children: subtitle
		}) : null]
	});
}
function FastTab({ title, summary, children, defaultOpen = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		open: defaultOpen,
		className: "bc-card mb-2 group",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
			className: "flex cursor-pointer list-none items-center justify-between px-3 py-2 hover:bg-secondary",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[13px] font-semibold text-heading",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[12px] text-muted-foreground",
				children: summary
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border p-3",
			children
		})]
	});
}
var STATUS_CLASS = {
	valid: "bg-status-valid",
	error: "bg-status-error",
	warning: "bg-status-warning",
	processing: "bg-status-processing",
	idle: "bg-status-idle"
};
function StatusIndicator({ kind, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1.5 text-[12px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2 w-2 rounded-full ${STATUS_CLASS[kind]}` }), label]
	});
}
function Field({ label, value, onChange, placeholder, maxLength }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "bc-label",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: "bc-input focus:border-ring",
			value,
			maxLength,
			placeholder,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
//#endregion
export { Field as a, FastTab as i, CommandBar as n, PageTitle as o, CommandButton as r, StatusIndicator as s, AppShell as t };
