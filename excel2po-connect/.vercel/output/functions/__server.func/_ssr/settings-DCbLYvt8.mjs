import { i as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as Field, o as PageTitle, t as AppShell } from "./shell-CaMCdGB4.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-DCbLYvt8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "po-converter-settings";
var DEFAULTS = {
	sourceAddress: "MTS",
	destinationAddress: "000",
	provider: "MATES",
	version: "2.18",
	organisationCode: "GG",
	countryCode: "ZA",
	channel: "E",
	encoding: "windows-1252",
	enforceCRLF: true,
	allowAlphaTruncation: false,
	treatWarningsAsErrors: false,
	retentionDays: "7"
};
function Settings() {
	const [settings, setSettings] = (0, import_react.useState)(DEFAULTS);
	(0, import_react.useEffect)(() => {
		const stored = window.localStorage.getItem(KEY);
		if (stored) setSettings({
			...DEFAULTS,
			...JSON.parse(stored)
		});
	}, []);
	const set = (key, value) => setSettings((s) => ({
		...s,
		[key]: value
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
		title: "Settings",
		subtitle: "Defaults applied to new conversions."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bc-card max-w-3xl p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Default source address",
						value: settings.sourceAddress,
						onChange: (v) => set("sourceAddress", v),
						maxLength: 3
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Default destination address",
						value: settings.destinationAddress,
						onChange: (v) => set("destinationAddress", v),
						maxLength: 3
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Provider",
						value: settings.provider,
						onChange: (v) => set("provider", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Version",
						value: settings.version,
						onChange: (v) => set("version", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Default organisation",
						value: settings.organisationCode,
						onChange: (v) => set("organisationCode", v),
						maxLength: 2
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Default country",
						value: settings.countryCode,
						onChange: (v) => set("countryCode", v),
						maxLength: 2
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Default channel",
						value: settings.channel,
						onChange: (v) => set("channel", v),
						maxLength: 1
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Output encoding",
						value: settings.encoding,
						onChange: (v) => set("encoding", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "File retention (days)",
						value: settings.retentionDays,
						onChange: (v) => set("retentionDays", v)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-1 text-[12.5px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Enforce CRLF line endings",
						checked: settings.enforceCRLF,
						onChange: (v) => set("enforceCRLF", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Allow alpha truncation",
						checked: settings.allowAlphaTruncation,
						onChange: (v) => set("allowAlphaTruncation", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Treat warnings as errors",
						checked: settings.treatWarningsAsErrors,
						onChange: (v) => set("treatWarningsAsErrors", v)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "mt-3 rounded-[2px] bg-primary px-3 py-1 text-[12.5px] text-primary-foreground hover:bg-primary/90",
				onClick: () => {
					window.localStorage.setItem(KEY, JSON.stringify(settings));
					toast.success("Settings saved");
				},
				children: "Save settings"
			})
		]
	})] });
}
function Toggle({ label, checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "checkbox",
			checked,
			onChange: (e) => onChange(e.target.checked)
		}), label]
	});
}
//#endregion
export { Settings as component };
