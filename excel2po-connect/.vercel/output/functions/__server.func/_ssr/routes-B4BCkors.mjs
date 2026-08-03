import { i as __toESM } from "../_runtime.mjs";
import { O as isRedirect, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as saveMappingProfileFn, d as validateConversionFn, l as selectSheetFn, r as generateConversionFn, u as uploadExcelFn } from "./conversion.functions-CvmzUFl_.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as RefreshCw, c as FileText, d as Eraser, f as Download, h as Beaker, m as CircleCheck, t as Upload, u as FileCog } from "../_libs/lucide-react.mjs";
import { a as Field, i as FastTab, n as CommandBar, o as PageTitle, r as CommandButton, s as StatusIndicator, t as AppShell } from "./shell-CaMCdGB4.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as getMappingOptionLabel, t as PALLET_FIELDS } from "./mapping-DJBRHONd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B4BCkors.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var emptyHeader = {
	sourceAddress: "MTS",
	destinationAddress: "000",
	sequenceNumber: "0001",
	batchNumber: "465",
	loadId: "",
	loadReference: "",
	locationCode: "",
	containerNumber: "",
	sealNumber: "",
	consignmentNumber: "",
	organisationCode: "",
	countryCode: "ZA",
	channel: "E",
	destinationType: "PO",
	destinationLocation: "",
	stuffingDate: "",
	transactionDate: "",
	transactionTime: "",
	provider: "MATES",
	version: "2.18",
	fileName: ""
};
function downloadText(fileName, content) {
	const blob = new Blob([content], { type: "text/plain;charset=windows-1252" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	link.click();
	URL.revokeObjectURL(url);
}
function toBase64(buffer) {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
	return btoa(binary);
}
function ConvertExcelPage() {
	const upload = useServerFn(uploadExcelFn);
	const selectSheet = useServerFn(selectSheetFn);
	const validate = useServerFn(validateConversionFn);
	const generate = useServerFn(generateConversionFn);
	const saveProfile = useServerFn(saveMappingProfileFn);
	const fileRef = (0, import_react.useRef)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [inspection, setInspection] = (0, import_react.useState)(null);
	const [mapping, setMapping] = (0, import_react.useState)({});
	const [header, setHeader] = (0, import_react.useState)(emptyHeader);
	const [result, setResult] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [selectedIssue, setSelectedIssue] = (0, import_react.useState)(null);
	const [logLines, setLogLines] = (0, import_react.useState)([]);
	const status = !inspection ? "idle" : busy ? "processing" : result ? result.errors.length ? "error" : result.warnings.length ? "warning" : "valid" : "idle";
	const statusLabel = !inspection ? "Not processed" : busy ? "Processing" : result ? result.errors.length ? `${result.errors.length} error(s)` : result.warnings.length ? `${result.warnings.length} warning(s)` : "Valid" : "Awaiting validation";
	const generatedName = (0, import_react.useMemo)(() => {
		if (header.fileName?.trim()) return header.fileName.trim();
		const seq = String(header.sequenceNumber || header.batchNumber || "").trim().padStart(3, "0");
		return `PO${String(header.sourceAddress || "000").trim().slice(0, 3).padEnd(3, "0")}${seq}.${String(header.destinationAddress || "000").trim().slice(0, 3).padEnd(3, "0")}`;
	}, [header]);
	const addLog = (message) => setLogLines((lines) => [`${(/* @__PURE__ */ new Date()).toISOString()}  ${message}`, ...lines].slice(0, 300));
	function mergeSuggestedHeaderValues(currentHeader, suggested) {
		if (!suggested) return currentHeader;
		const suggestedValues = Object.fromEntries(Object.entries(suggested).filter(([key, value]) => {
			const currentValue = currentHeader[key];
			return typeof value === "string" && value.trim().length > 0 && (typeof currentValue !== "string" || currentValue.trim().length === 0);
		}));
		return {
			...currentHeader,
			...suggestedValues
		};
	}
	const payload = () => {
		if (!inspection) throw new Error("Upload an Excel file first.");
		const normalizedHeader = header.fileName?.trim() ? {
			...header,
			fileName: header.fileName.trim()
		} : {
			...header,
			fileName: void 0
		};
		return {
			uploadId: inspection.uploadId,
			sheetName: inspection.sheetName,
			mapping,
			header: normalizedHeader
		};
	};
	async function handleFile(file) {
		setBusy("Uploading");
		try {
			const base64 = toBase64(await file.arrayBuffer());
			const data = await upload({ data: {
				fileName: file.name,
				fileSize: file.size,
				base64
			} });
			setInspection(data);
			setMapping(data.suggestedMapping);
			setHeader((prev) => mergeSuggestedHeaderValues(prev, data.suggestedHeaderValues));
			setResult(null);
			setPreview(null);
			addLog(`File received: ${data.fileName} (${data.rowCount} rows, ${data.headers.length} columns)`);
			toast.success(`${data.fileName} uploaded`);
		} catch (error) {
			toast.error(error.message);
			addLog(`ERROR ${error.message}`);
		} finally {
			setBusy(null);
		}
	}
	async function changeSheet(sheetName) {
		if (!inspection) return;
		setBusy("Reading worksheet");
		try {
			const data = await selectSheet({ data: {
				uploadId: inspection.uploadId,
				sheetName
			} });
			setInspection({
				...inspection,
				...data
			});
			setMapping(data.suggestedMapping);
			setHeader((prev) => mergeSuggestedHeaderValues(prev, data.suggestedHeaderValues));
			addLog(`Worksheet selected: ${sheetName}`);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setBusy(null);
		}
	}
	async function runValidate() {
		setBusy("Validating");
		try {
			const data = await validate({ data: payload() });
			setResult(data);
			data.logs.forEach((l) => addLog(`${l.module}: ${l.action}${l.message ? ` — ${l.message}` : ""}`));
			if (data.errors.length) toast.error(`${data.errors.length} validation error(s)`);
			else toast.success("Validation passed");
		} catch (error) {
			toast.error(error.message);
			addLog(`ERROR ${error.message}`);
		} finally {
			setBusy(null);
		}
	}
	async function runGenerate() {
		setBusy("Generating");
		try {
			const data = await generate({ data: payload() });
			setResult(data);
			addLog(`Generation ${data.status}: ${data.recordCount} records, ${data.palletCount} pallets`);
			if (data.errors.length) {
				toast.error("Generation blocked by validation errors");
				setPreview(null);
				return;
			}
			const { getConversionPreviewFn } = await import("./conversion.functions-CvmzUFl_.mjs").then((n) => n.t).then((n) => n.t);
			const file = await getConversionPreviewFn({ data: { id: data.conversionId } });
			setPreview(file);
			toast.success(`${file.fileName} generated`);
		} catch (error) {
			toast.error(error.message);
			addLog(`ERROR ${error.message}`);
		} finally {
			setBusy(null);
		}
	}
	async function downloadReport() {
		if (!result) return;
		const { getConversionReportFn } = await import("./conversion.functions-CvmzUFl_.mjs").then((n) => n.t).then((n) => n.t);
		try {
			const report = await getConversionReportFn({ data: { id: result.conversionId } });
			downloadText(report.fileName, report.content);
		} catch {
			toast.error("Generate the PO file first to produce a report.");
		}
	}
	function clearAll() {
		setInspection(null);
		setMapping({});
		setResult(null);
		setPreview(null);
		setSelectedIssue(null);
		setLogLines([]);
	}
	const issues = [...result?.errors ?? [], ...result?.warnings ?? []];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
			title: "Excel to PO Conversion",
			subtitle: "Upload a pallet spreadsheet and transmit a Paltrack fixed-width PO file."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandBar, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandButton, {
				icon: Upload,
				onClick: () => fileRef.current?.click(),
				primary: true,
				children: "Upload Excel"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandButton, {
				icon: Beaker,
				onClick: () => {
					setHeader({
						...emptyHeader,
						locationCode: "CPT0001",
						containerNumber: "MSDU9721477",
						sealNumber: "ZA123456",
						consignmentNumber: "CONS000123",
						organisationCode: "GG",
						destinationLocation: "CPT0001"
					});
					addLog("Sample PO header loaded");
				},
				children: "Load Sample PO"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandButton, {
				icon: CircleCheck,
				onClick: runValidate,
				disabled: !inspection || !!busy,
				children: "Validate"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandButton, {
				icon: FileCog,
				onClick: runGenerate,
				disabled: !inspection || !!busy,
				children: "Generate PO"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandButton, {
				icon: Download,
				disabled: !preview,
				onClick: () => preview && downloadText(preview.fileName, preview.content),
				children: "Download PO"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandButton, {
				icon: FileText,
				disabled: !result,
				onClick: downloadReport,
				children: "Download Validation Report"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandButton, {
				icon: Eraser,
				onClick: clearAll,
				children: "Clear"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandButton, {
				icon: RefreshCw,
				onClick: () => inspection && changeSheet(inspection.sheetName),
				children: "Refresh"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-auto pr-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIndicator, {
					kind: status,
					label: busy ?? statusLabel
				})
			})
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: fileRef,
			type: "file",
			accept: ".xlsx",
			className: "hidden",
			onChange: (e) => {
				const file = e.target.files?.[0];
				if (file) handleFile(file);
				e.target.value = "";
			}
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastTab, {
						title: "General",
						summary: inspection ? inspection.fileName : "No file",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							onDragOver: (e) => e.preventDefault(),
							onDrop: (e) => {
								e.preventDefault();
								const file = e.dataTransfer.files?.[0];
								if (file) handleFile(file);
							},
							className: "flex items-center justify-between border border-dashed border-input bg-secondary px-3 py-4 text-[12.5px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "Drag an .xlsx file here, or use Upload Excel on the command bar."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIndicator, {
								kind: status,
								label: statusLabel
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastTab, {
						title: "File Information",
						summary: inspection ? `${inspection.rowCount} rows` : "—",
						children: inspection ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-x-6 gap-y-1 text-[12.5px] md:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									label: "File name",
									value: inspection.fileName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									label: "File size",
									value: `${(inspection.fileSize / 1024).toFixed(1)} KB`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									label: "Uploaded",
									value: new Date(inspection.uploadedAt).toLocaleString()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									label: "Rows",
									value: String(inspection.rowCount)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									label: "Columns",
									value: String(inspection.headers.length)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "bc-label",
										children: "Worksheet"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: "bc-input",
										value: inspection.sheetName,
										onChange: (e) => void changeSheet(e.target.value),
										children: inspection.worksheets.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: s.name,
											children: [
												s.name,
												" (",
												s.rowCount,
												" rows)"
											]
										}, s.name))
									})]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastTab, {
						title: "PO Header",
						summary: generatedName,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 md:grid-cols-3 lg:grid-cols-4",
							children: [[
								[
									"Source Address",
									"sourceAddress",
									3
								],
								[
									"Destination Address",
									"destinationAddress",
									3
								],
								[
									"Sequence Number",
									"sequenceNumber",
									10
								],
								[
									"Batch Number",
									"batchNumber",
									10
								],
								[
									"Load ID",
									"loadId",
									10
								],
								[
									"Load Reference",
									"loadReference",
									10
								],
								[
									"Location Code",
									"locationCode",
									7
								],
								[
									"Container Number",
									"containerNumber",
									11
								],
								[
									"Seal Number",
									"sealNumber",
									15
								],
								[
									"Consignment Number",
									"consignmentNumber",
									10
								],
								[
									"Organisation Code",
									"organisationCode",
									2
								],
								[
									"Country Code",
									"countryCode",
									2
								],
								[
									"Channel",
									"channel",
									1
								],
								[
									"Destination Type",
									"destinationType",
									2
								],
								[
									"Destination Location",
									"destinationLocation",
									7
								],
								[
									"Stuffing Date (yyyymmdd)",
									"stuffingDate",
									8
								],
								[
									"Transaction Date (yyyymmdd)",
									"transactionDate",
									8
								],
								[
									"Transaction Time (hh:mm)",
									"transactionTime",
									5
								],
								[
									"Provider",
									"provider",
									30
								],
								[
									"Version",
									"version",
									30
								]
							].map(([label, key, max]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label,
								maxLength: max,
								value: header[key] ?? "",
								onChange: (value) => setHeader((h) => ({
									...h,
									[key]: value
								}))
							}, key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "File Name (auto)",
								value: header.fileName ?? "",
								placeholder: generatedName,
								onChange: (value) => setHeader((h) => ({
									...h,
									fileName: value
								}))
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastTab, {
						title: "Column Mapping",
						summary: `${Object.keys(mapping).length} mapped`,
						children: inspection ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-2 flex gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "rounded-[2px] border border-input px-2 py-1 text-[12px] hover:bg-accent",
								onClick: async () => {
									const name = window.prompt("Mapping profile name", "Paltrack PO");
									if (!name) return;
									await saveProfile({ data: {
										name,
										mapping
									} });
									toast.success("Mapping profile saved");
								},
								children: "Save mapping profile"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-80 overflow-auto border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full border-collapse text-[12px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "sticky top-0 bg-secondary text-left",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "PO Field" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Record" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Positions" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Type" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Required" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Excel Header" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Sample Value" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Status" })
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: PALLET_FIELDS.map((field) => {
									const selected = mapping[field.key] ?? "";
									const sample = selected ? inspection.previewRows[0]?.[selected] ?? "" : "";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-border hover:bg-secondary/60",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: field.label }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: field.recordType }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td, { children: [
												field.from,
												"–",
												field.to
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: field.type }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: field.required ? "Yes" : "No" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												className: "bc-input",
												value: selected,
												onChange: (e) => setMapping((m) => ({
													...m,
													[field.key]: e.target.value || void 0
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "(not mapped)"
												}), inspection.headers.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: h,
													children: getMappingOptionLabel(h, field.key)
												}, h))]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
												className: "max-w-[160px] truncate",
												children: sample
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIndicator, {
												kind: selected ? "valid" : field.required ? "error" : "idle",
												label: selected ? "Mapped" : field.required ? "Required" : "Optional"
											}) })
										]
									}, field.key);
								}) })]
							})
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastTab, {
						title: "Excel Preview",
						summary: inspection ? `${inspection.previewRows.length} rows` : "—",
						defaultOpen: false,
						children: inspection ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-72 overflow-auto border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "border-collapse text-[12px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "sticky top-0 bg-secondary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "#" }), inspection.headers.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: h }, h))] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: inspection.previewRows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: i + 2 }), inspection.headers.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
										className: "whitespace-nowrap",
										children: row[h]
									}, h))]
								}, i)) })]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastTab, {
						title: "Validation",
						summary: `${result?.errors.length ?? 0} errors / ${result?.warnings.length ?? 0} warnings`,
						children: issues.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-72 overflow-auto border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full border-collapse text-[12px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "sticky top-0 bg-secondary text-left",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Severity" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Excel Row" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Record" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Field" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Code" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Message" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Value" })
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: issues.map((issue, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									onClick: () => setSelectedIssue(issue),
									className: "cursor-pointer border-t border-border hover:bg-secondary",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIndicator, {
											kind: issue.severity === "error" ? "error" : "warning",
											label: issue.severity
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: issue.excelRow ?? "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: issue.recordType ?? "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: issue.field ?? "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: issue.code }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: issue.message }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
											className: "max-w-[160px] truncate",
											children: issue.value ?? ""
										})
									]
								}, i)) })]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[12.5px] text-muted-foreground",
							children: result ? "No validation issues." : "Run Validate to check the mapped data."
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastTab, {
						title: "Generated PO Preview",
						summary: preview?.fileName ?? "—",
						children: preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-96 overflow-auto border border-border bg-card",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "font-mono text-[11.5px] leading-[1.35]",
								children: preview.content.split("\r\n").filter(Boolean).map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex whitespace-pre",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sticky left-0 w-12 shrink-0 select-none border-r border-border bg-secondary px-1 text-right text-muted-foreground",
										children: i + 1
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "px-2",
										children: line
									})]
								}, i))
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[12.5px] text-muted-foreground",
							children: "Generate the PO file to preview it."
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastTab, {
						title: "Processing Log",
						summary: `${logLines.length} entries`,
						defaultOpen: false,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "max-h-64 overflow-auto bg-secondary p-2 font-mono text-[11.5px]",
							children: logLines.join("\n") || "No activity yet."
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bc-card p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-2 text-[12.5px] font-semibold text-heading",
							children: "Conversion FactBox"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "space-y-1 text-[12px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Conversion ID",
									value: result?.conversionId ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Status",
									value: result?.status ?? "Not processed"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Output file",
									value: result?.fileName ?? generatedName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Records",
									value: String(result?.recordCount ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Pallets",
									value: String(result?.palletCount ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Cartons",
									value: String(result?.cartonCount ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Valid rows",
									value: String(result?.validRows ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Invalid rows",
									value: String(result?.invalidRows ?? 0)
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bc-card p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-2 text-[12.5px] font-semibold text-heading",
							children: "Record Lengths"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1 text-[12px]",
							children: [(result?.recordLengths ?? []).slice(0, 8).map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.recordType }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIndicator, {
									kind: r.ok ? "valid" : "error",
									label: `${r.length}/${r.expected}`
								})]
							}, i)), !result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground",
								children: "Not calculated."
							}) : null]
						})]
					}),
					selectedIssue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bc-card p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-2 text-[12.5px] font-semibold text-heading",
								children: "Error Details"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "space-y-1 text-[12px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Code",
										value: selectedIssue.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Severity",
										value: selectedIssue.severity
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Record",
										value: selectedIssue.recordType ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Excel row",
										value: String(selectedIssue.excelRow ?? "—")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Field",
										value: selectedIssue.field ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Positions",
										value: selectedIssue.fromPosition ? `${selectedIssue.fromPosition}–${selectedIssue.toPosition}` : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Expected",
										value: String(selectedIssue.expectedLength ?? "—")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Actual",
										value: String(selectedIssue.actualLength ?? "—")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Value",
										value: selectedIssue.value ?? "—"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-[12px] text-muted-foreground",
								children: selectedIssue.message
							})
						]
					}) : null
				]
			})]
		})
	] });
}
function Info({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "bc-label",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: value })] });
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-2 border-b border-border/60 pb-0.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "truncate text-right",
			children: value
		})]
	});
}
function Th({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: "border-r border-border px-2 py-1 font-semibold whitespace-nowrap",
		children
	});
}
function Td({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: `border-r border-border px-2 py-1 align-top ${className}`,
		children
	});
}
function Empty() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[12.5px] text-muted-foreground",
		children: "Upload an Excel file to continue."
	});
}
//#endregion
export { ConvertExcelPage as component };
