import { i as __toESM } from "../_runtime.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime, n as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DNk_kHjN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var styles_default = "/assets/styles-ztO2pnRL.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$7 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Excel to PO Conversion | Paltrack Transmission Utility" },
			{
				name: "description",
				content: "Convert pallet spreadsheets into Paltrack fixed-width PO transmission files with backend validation, record-length checks and .000 download."
			},
			{
				name: "author",
				content: "Lovable"
			},
			{
				property: "og:title",
				content: "Excel to PO Conversion | Paltrack Transmission Utility"
			},
			{
				property: "og:description",
				content: "Convert pallet spreadsheets into Paltrack fixed-width PO transmission files with backend validation, record-length checks and .000 download."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			},
			{
				name: "twitter:title",
				content: "Excel to PO Conversion | Paltrack Transmission Utility"
			},
			{
				name: "twitter:description",
				content: "Convert pallet spreadsheets into Paltrack fixed-width PO transmission files with backend validation, record-length checks and .000 download."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6931f8bf-181d-45ac-b0a1-e92a9feeadae/id-preview-e3353f7d--1ac2a44e-d75f-4c21-bc6c-5e2834e72f55.lovable.app-1785404237519.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6931f8bf-181d-45ac-b0a1-e92a9feeadae/id-preview-e3353f7d--1ac2a44e-d75f-4c21-bc6c-5e2834e72f55.lovable.app-1785404237519.png"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.ico",
			type: "image/x-icon"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$7.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { position: "top-right" })]
	});
}
var $$splitComponentImporter$6 = () => import("./routes-B4BCkors.mjs");
var Route$6 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Excel to PO Conversion | Paltrack Transmission Utility" },
		{
			name: "description",
			content: "Convert pallet spreadsheets into Paltrack fixed-width PO transmission files with backend validation, record-length checks and .000 download."
		},
		{
			property: "og:title",
			content: "Excel to PO Conversion | Paltrack Transmission Utility"
		},
		{
			property: "og:description",
			content: "Convert pallet spreadsheets into Paltrack fixed-width PO transmission files with backend validation, record-length checks and .000 download."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./dashboard-BjKy0qMd.mjs");
var Route$5 = createFileRoute("/dashboard")({
	head: () => ({ meta: [
		{ title: "Conversion Dashboard | Excel to PO Converter" },
		{
			name: "description",
			content: "Daily conversion counts, failures and recent Paltrack PO activity."
		},
		{
			property: "og:title",
			content: "Conversion Dashboard"
		},
		{
			property: "og:description",
			content: "Daily conversion counts, failures and recent Paltrack PO activity."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./history-UjENzRsr.mjs");
var Route$4 = createFileRoute("/history")({
	head: () => ({ meta: [
		{ title: "Conversion History | Excel to PO Converter" },
		{
			name: "description",
			content: "Every Excel to Paltrack PO conversion with record, pallet and carton totals."
		},
		{
			property: "og:title",
			content: "Conversion History"
		},
		{
			property: "og:description",
			content: "Every Excel to Paltrack PO conversion with totals and status."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./logs-D3pB6EnO.mjs");
var Route$3 = createFileRoute("/logs")({
	head: () => ({ meta: [
		{ title: "System Logs | Excel to PO Converter" },
		{
			name: "description",
			content: "Structured backend processing logs for every Excel to PO conversion stage."
		},
		{
			property: "og:title",
			content: "System Logs"
		},
		{
			property: "og:description",
			content: "Structured backend processing logs per conversion stage."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./mapping-profiles-C2fWjgd2.mjs");
var Route$2 = createFileRoute("/mapping-profiles")({
	head: () => ({ meta: [
		{ title: "Mapping Profiles | Excel to PO Converter" },
		{
			name: "description",
			content: "Reusable Excel column to PO field mapping profiles for Paltrack transmissions."
		},
		{
			property: "og:title",
			content: "Mapping Profiles"
		},
		{
			property: "og:description",
			content: "Reusable Excel column to PO field mapping profiles."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./settings-DCbLYvt8.mjs");
var Route$1 = createFileRoute("/settings")({
	head: () => ({ meta: [
		{ title: "Settings | Excel to PO Converter" },
		{
			name: "description",
			content: "Default PO header values, output encoding and validation behaviour."
		},
		{
			property: "og:title",
			content: "Converter Settings"
		},
		{
			property: "og:description",
			content: "Default PO header values, encoding and validation behaviour."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./validation-errors-DA67we_o.mjs");
var Route = createFileRoute("/validation-errors")({
	head: () => ({ meta: [
		{ title: "Validation Errors | Excel to PO Converter" },
		{
			name: "description",
			content: "All PO validation failures with Excel row, record type, field and character positions."
		},
		{
			property: "og:title",
			content: "Validation Errors"
		},
		{
			property: "og:description",
			content: "PO validation failures with Excel row, field and character positions."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$6.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$7
	}),
	DashboardRoute: Route$5.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => Route$7
	}),
	HistoryRoute: Route$4.update({
		id: "/history",
		path: "/history",
		getParentRoute: () => Route$7
	}),
	LogsRoute: Route$3.update({
		id: "/logs",
		path: "/logs",
		getParentRoute: () => Route$7
	}),
	MappingProfilesRoute: Route$2.update({
		id: "/mapping-profiles",
		path: "/mapping-profiles",
		getParentRoute: () => Route$7
	}),
	SettingsRoute: Route$1.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => Route$7
	}),
	ValidationErrorsRoute: Route.update({
		id: "/validation-errors",
		path: "/validation-errors",
		getParentRoute: () => Route$7
	})
};
var routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
