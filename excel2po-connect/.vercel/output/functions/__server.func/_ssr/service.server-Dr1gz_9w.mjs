import { a as suggestMapping, i as suggestHeaderValues, n as applyMapping } from "./mapping-DJBRHONd.mjs";
import { logEvent, newId, pushLogs, store } from "./store.server-DSi65Utv.mjs";
import { n as utils, t as readSync } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/service.server-Dr1gz_9w.js
/** Excel reading (server-only). Uses SheetJS with text formatting so that
* long numeric codes such as SSCC keep leading zeroes and never become
* scientific notation. */
function sheetMatrix(ws) {
	return utils.sheet_to_json(ws, {
		header: 1,
		raw: false,
		defval: "",
		blankrows: false
	});
}
function readWorkbook(base64) {
	return readSync(base64, {
		type: "base64",
		cellDates: false,
		cellText: true
	});
}
function inspectWorkbook(base64, sheetName, previewLimit = 20) {
	const wb = readWorkbook(base64);
	const worksheets = wb.SheetNames.map((name) => {
		const matrix = sheetMatrix(wb.Sheets[name]);
		return {
			name,
			rowCount: Math.max(matrix.length - 1, 0),
			columnCount: matrix[0]?.length ?? 0
		};
	});
	const selected = sheetName && wb.SheetNames.includes(sheetName) ? sheetName : wb.SheetNames[0];
	const matrix = sheetMatrix(wb.Sheets[selected]);
	const headers = (matrix[0] ?? []).map((h, i) => String(h ?? "").trim() || `Column ${i + 1}`);
	const dataRows = matrix.slice(1);
	const previewRows = dataRows.slice(0, previewLimit).map((row) => Object.fromEntries(headers.map((h, i) => [h, String(row[i] ?? "")])));
	return {
		worksheets,
		sheetName: selected,
		headers,
		rowCount: dataRows.length,
		previewRows
	};
}
function readSheetRows(base64, sheetName) {
	const wb = readWorkbook(base64);
	const name = wb.SheetNames.includes(sheetName) ? sheetName : wb.SheetNames[0];
	const matrix = sheetMatrix(wb.Sheets[name]);
	const headers = (matrix[0] ?? []).map((h, i) => String(h ?? "").trim() || `Column ${i + 1}`);
	return {
		headers,
		rows: matrix.slice(1).map((row) => Object.fromEntries(headers.map((h, i) => [h, String(row[i] ?? "").trim()]))).filter((row) => Object.values(row).some((v) => v !== ""))
	};
}
function blankLine(length) {
	return " ".repeat(length);
}
function setFixedWidthField(buffer, fromPosition, toPosition, value, options = {}) {
	const errors = [];
	const { align = "alpha", allowTruncate = align === "numeric" ? false : false, field, recordType, excelRow } = options;
	const width = toPosition - fromPosition + 1;
	if (width <= 0) throw new Error(`Invalid field definition ${recordType ?? ""}.${field ?? ""}: ${fromPosition}-${toPosition}`);
	if (fromPosition < 1 || toPosition > buffer.length) throw new Error(`Field ${recordType ?? ""}.${field ?? ""} (${fromPosition}-${toPosition}) falls outside record length ${buffer.length}`);
	let raw = value === null || value === void 0 ? "" : String(value);
	raw = raw.trim();
	if (raw.length > width) if (allowTruncate) {
		errors.push({
			code: "FIELD_TRUNCATED",
			severity: "warning",
			message: `Value "${raw}" was truncated to ${width} characters.`,
			recordType,
			excelRow,
			field,
			fromPosition,
			toPosition,
			expectedLength: width,
			actualLength: raw.length,
			value: raw
		});
		raw = raw.slice(0, width);
	} else {
		errors.push({
			code: "INVALID_FIELD_LENGTH",
			severity: "error",
			message: `${field ?? "Field"} must be at most ${width} characters.`,
			recordType,
			excelRow,
			field,
			fromPosition,
			toPosition,
			expectedLength: width,
			actualLength: raw.length,
			value: raw
		});
		raw = raw.slice(0, width);
	}
	const padChar = options.pad ?? (align === "numeric" ? "0" : " ");
	const padded = align === "numeric" ? raw.padStart(width, raw === "" ? " " : padChar) : raw.padEnd(width, padChar);
	const next = buffer.slice(0, fromPosition - 1) + padded + buffer.slice(toPosition);
	if (next.length !== buffer.length) throw new Error(`Writing ${recordType ?? ""}.${field ?? ""} changed record length (${buffer.length} -> ${next.length})`);
	return {
		buffer: next,
		errors
	};
}
/** Small builder that accumulates errors while writing fields. */
var RecordWriter = class {
	length;
	recordType;
	excelRow;
	buffer;
	errors = [];
	constructor(length, recordType, excelRow) {
		this.length = length;
		this.recordType = recordType;
		this.excelRow = excelRow;
		this.buffer = blankLine(length);
	}
	put(from, to, value, options = {}) {
		const result = setFixedWidthField(this.buffer, from, to, value, {
			...options,
			recordType: this.recordType,
			excelRow: this.excelRow
		});
		this.buffer = result.buffer;
		this.errors.push(...result.errors);
		return this;
	}
	num(from, to, value, options = {}) {
		return this.put(from, to, value, {
			...options,
			align: "numeric"
		});
	}
	done() {
		if (this.buffer.length !== this.length) this.errors.push({
			code: "INVALID_RECORD_LENGTH",
			severity: "error",
			message: `${this.recordType} record must be exactly ${this.length} characters (actual ${this.buffer.length}).`,
			recordType: this.recordType,
			excelRow: this.excelRow,
			expectedLength: this.length,
			actualLength: this.buffer.length
		});
		return {
			line: this.buffer,
			errors: this.errors
		};
	}
};
/** Date, time and numeric formatting helpers for the PO layout. */
var EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);
function parseExcelDate(value) {
	if (value === null || value === void 0 || value === "") return null;
	if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
	if (typeof value === "number" && isFinite(value)) {
		if (value <= 0 || value > 6e4) return null;
		return new Date(EXCEL_EPOCH_UTC + Math.round(value) * 864e5);
	}
	const text = String(value).trim();
	if (!text) return null;
	if (/^\d{5}(\.\d+)?$/.test(text)) return parseExcelDate(Number(text));
	let m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(text);
	if (m) return makeUTC(+m[1], +m[2], +m[3], +m[4], +m[5]);
	m = /^(\d{4})(\d{2})(\d{2})(\d{2}):(\d{2})$/.exec(text);
	if (m) return makeUTC(+m[1], +m[2], +m[3], +m[4], +m[5]);
	m = /^(\d{4})(\d{2})(\d{2})$/.exec(text);
	if (m) return makeUTC(+m[1], +m[2], +m[3]);
	m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(text);
	if (m) return makeUTC(+m[1], +m[2], +m[3]);
	m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/.exec(text);
	if (m) return makeUTC(+m[3], +m[2], +m[1]);
	const parsed = new Date(text);
	return isNaN(parsed.getTime()) ? null : parsed;
}
function makeUTC(y, mo, d, hh = 0, mm = 0) {
	if (mo < 1 || mo > 12 || d < 1 || d > 31 || hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
	const date = new Date(Date.UTC(y, mo - 1, d, hh, mm));
	if (date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d || date.getUTCHours() !== hh || date.getUTCMinutes() !== mm) return null;
	return date;
}
function formatPODate(value) {
	const date = value instanceof Date ? value : parseExcelDate(value);
	if (!date) return null;
	return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
}
function formatPODateTime(value) {
	const date = value instanceof Date ? value : parseExcelDate(value);
	if (!date) return null;
	return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}
/** hh:mm */
function formatPOTime(date = /* @__PURE__ */ new Date()) {
	return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}
function toNumber(value) {
	if (value === null || value === void 0 || value === "") return null;
	if (typeof value === "number") return isFinite(value) ? value : null;
	const text = String(value).trim().replace(/\s/g, "").replace(/,/g, "");
	if (!text || !/^-?\d*\.?\d+$/.test(text)) return null;
	const n = Number(text);
	return isFinite(n) ? n : null;
}
/** Zero padded integer, e.g. formatInteger(40, 5) -> "00040" */
function formatInteger(value, width) {
	const n = toNumber(value);
	const rounded = n === null ? 0 : Math.round(n);
	const sign = rounded < 0 ? "-" : "";
	let result = sign + String(Math.abs(rounded)).padStart(Math.max(0, width - sign.length), "0");
	if (result.length > width) result = result.slice(-width);
	return result;
}
/** Zero padded decimal with fixed decimals, e.g. 1409 -> "001409.000" */
function formatDecimal(value, width, decimals) {
	const n = toNumber(value) ?? 0;
	const sign = n < 0 ? "-" : "";
	let result = sign + Math.abs(n).toFixed(decimals).padStart(Math.max(0, width - sign.length), "0");
	if (result.length > width) result = result.slice(-width);
	return result;
}
/** Ensure a numeric-looking Excel value never renders as 1.23E+17. */
function toPlainText(value) {
	if (value === null || value === void 0) return "";
	if (typeof value === "number") {
		if (Number.isInteger(value)) return BigInt(Math.round(value)).toString();
		return String(value);
	}
	return String(value).trim();
}
function isValidSSCC(value) {
	return /^\d{18}$/.test(value);
}
/** Descriptive text -> Paltrack code translation tables. */
var CODE_TABLES = {
	country: {
		"south africa": "ZA",
		"united kingdom": "GB",
		netherlands: "NL",
		germany: "DE",
		"united arab emirates": "AE",
		"saudi arabia": "SA",
		"united states": "US",
		canada: "CA",
		china: "CN",
		russia: "RU"
	},
	channel: {
		export: "E",
		local: "L",
		industrial: "I"
	},
	unitType: {
		pallet: "P",
		bin: "B",
		carton: "C"
	},
	yesNo: {
		yes: "Y",
		no: "N",
		true: "Y",
		false: "N"
	},
	mixed: {
		generic: "G",
		mixed: "Y",
		single: "N"
	}
};
/**
* Translate a descriptive Excel value into a code.
* Values already short enough for the field are passed through untouched.
*/
function lookupCode(table, raw, maxLength) {
	const text = raw === null || raw === void 0 ? "" : String(raw).trim();
	if (!text) return {
		value: "",
		unknown: false
	};
	const hit = (CODE_TABLES[table] ?? {})[text.toLowerCase()];
	if (hit) return {
		value: hit,
		unknown: false
	};
	if (text.length <= maxLength) return {
		value: text.toUpperCase(),
		unknown: false
	};
	return {
		value: "",
		unknown: true
	};
}
var RECORD_LENGTHS = {
	BH: 89,
	OH: 309,
	OL: 100,
	OK: 370,
	OC: 220,
	OP: 1012,
	BT: 60
};
function makeContext(header) {
	const now = /* @__PURE__ */ new Date();
	const sequenceSource = header.sequenceNumber?.trim() || header.batchNumber?.trim() || "1";
	const sequenceValue = Number.parseInt(sequenceSource, 10);
	const fileSequence = String(Number.isNaN(sequenceValue) ? 1 : sequenceValue).padStart(3, "0");
	const batchNumber = String(Number.isNaN(sequenceValue) ? 1 : sequenceValue).padStart(6, "0");
	const fromDepot = (header.sourceAddress?.trim() || "000").slice(0, 3);
	return {
		header,
		loadId: (header.loadId?.trim() || `${fromDepot}-${batchNumber}`).slice(0, 10),
		batchNumber,
		fileSequence,
		transactionDate: header.transactionDate?.trim() || formatPODate(now),
		transactionTime: header.transactionTime?.trim() || formatPOTime(now)
	};
}
function buildBHRecord(ctx) {
	const h = ctx.header;
	const w = new RecordWriter(RECORD_LENGTHS.BH, "BH");
	w.put(1, 2, "BH", { field: "recordType" });
	w.put(3, 5, (h.sourceAddress || "000").trim().slice(0, 3), { field: "sourceAddress" });
	w.num(6, 11, ctx.batchNumber, { field: "batchNumber" });
	w.put(12, 19, ctx.transactionDate, { field: "transactionDate" });
	w.put(20, 27, `${ctx.transactionTime}:00`, { field: "transactionTime" });
	w.put(28, 29, "", { field: "indicator" });
	w.put(30, 59, (h.provider || "Paltrack").trim(), {
		field: "provider",
		allowTruncate: true
	});
	w.put(60, 89, (h.version || "2.18").trim(), {
		field: "version",
		allowTruncate: true
	});
	const { line, errors } = w.done();
	return {
		recordType: "BH",
		line,
		errors
	};
}
function buildOHRecord(ctx, palletCount, cartonCount) {
	const h = ctx.header;
	const w = new RecordWriter(RECORD_LENGTHS.OH, "OH");
	w.put(1, 2, "OH", { field: "recordType" });
	w.put(3, 12, ctx.loadId, { field: "loadId" });
	w.put(13, 22, h.loadReference?.trim() || ctx.loadId, { field: "loadReference" });
	w.put(23, 47, h.loadReference?.trim() || ctx.loadId, { field: "loadName" });
	w.put(48, 48, "R", { field: "transportMode" });
	w.put(49, 49, h.loadType || "F", { field: "loadType" });
	w.put(50, 50, h.loadStatus || "P", { field: "loadStatus" });
	w.num(134, 138, formatInteger(palletCount, 5), { field: "palletCount" });
	w.num(139, 146, formatInteger(cartonCount, 8), { field: "cartonCount" });
	w.put(159, 160, h.destinationType || "DP", { field: "destinationType" });
	w.put(161, 167, h.locationCode, { field: "locationCode" });
	w.put(190, 196, h.locationCode, { field: "locationCode" });
	w.put(197, 200, ctx.transactionDate.slice(0, 4), { field: "season" });
	w.put(207, 214, `${(h.sourceAddress || "000").trim().slice(0, 3)}${ctx.fileSequence}`.slice(0, 8), { field: "tripNo" });
	w.put(215, 215, "Y", { field: "transmitFlag" });
	w.num(216, 220, formatInteger(1, 5), { field: "revision" });
	const { line, errors } = w.done();
	return {
		recordType: "OH",
		line,
		errors
	};
}
function buildOLRecord(ctx) {
	const h = ctx.header;
	const w = new RecordWriter(RECORD_LENGTHS.OL, "OL");
	w.put(1, 2, "OL", { field: "recordType" });
	w.put(3, 12, ctx.loadId, { field: "loadId" });
	w.put(13, 14, h.destinationType || "DP", { field: "destinationType" });
	w.put(15, 21, h.locationCode, { field: "locationCode" });
	w.num(22, 26, formatInteger(1, 5), { field: "sequence" });
	w.put(27, 27, "L", { field: "locationType" });
	w.put(67, 67, "Y", { field: "transmitFlag" });
	w.num(68, 72, formatInteger(1, 5), { field: "revision" });
	const { line, errors } = w.done();
	return {
		recordType: "OL",
		line,
		errors
	};
}
function buildOKRecord(ctx, palletCount) {
	const h = ctx.header;
	const w = new RecordWriter(RECORD_LENGTHS.OK, "OK");
	w.put(1, 2, "OK", { field: "recordType" });
	w.put(3, 12, ctx.loadId, { field: "loadId" });
	w.put(13, 19, h.locationCode, { field: "locationCode" });
	w.put(20, 30, h.containerNumber, { field: "containerNumber" });
	w.put(31, 38, h.sealNumber, { field: "sealNumber" });
	w.put(113, 119, h.locationCode, { field: "locationCode" });
	w.num(125, 129, formatInteger(palletCount, 5), { field: "palletCount" });
	w.put(159, 159, "T", { field: "containerType" });
	w.put(160, 160, "Y", { field: "transmitFlag" });
	w.num(161, 165, formatInteger(1, 5), { field: "revision" });
	w.put(200, 200, "S", { field: "sealType" });
	w.put(226, 240, h.sealNumber, { field: "sealNumber" });
	const { line, errors } = w.done();
	return {
		recordType: "OK",
		line,
		errors
	};
}
function buildOCRecord(ctx, palletCount, cartonCount) {
	const h = ctx.header;
	const w = new RecordWriter(RECORD_LENGTHS.OC, "OC");
	w.put(1, 2, "OC", { field: "recordType" });
	w.put(3, 12, ctx.loadId, { field: "loadId" });
	w.put(13, 19, h.locationCode, { field: "locationCode" });
	w.put(20, 21, h.organisationCode, { field: "organisationCode" });
	w.put(22, 31, h.consignmentNumber, { field: "consignmentNumber" });
	w.put(32, 33, "OT", { field: "consignmentType" });
	w.put(34, 41, h.stuffingDate?.trim() || ctx.transactionDate, { field: "stuffingDate" });
	w.put(48, 48, h.channel || "E", { field: "channel" });
	w.num(63, 70, formatInteger(cartonCount, 8), { field: "cartonCount" });
	w.num(71, 75, formatInteger(palletCount, 5), { field: "palletCount" });
	w.put(86, 89, ctx.transactionDate.slice(0, 4), { field: "season" });
	w.put(162, 162, "P", { field: "unitType" });
	w.put(168, 168, "Y", { field: "transmitFlag" });
	w.num(169, 173, formatInteger(1, 5), { field: "revision" });
	const { line, errors } = w.done();
	return {
		recordType: "OC",
		line,
		errors
	};
}
function buildOPRecord(ctx, row, sequence) {
	const h = ctx.header;
	const v = row.values;
	const w = new RecordWriter(RECORD_LENGTHS.OP, "OP", row.excelRow);
	const get = (key) => toPlainText(v[key]);
	const palletId = get("palletId");
	const ssccRaw = get("sscc") || (palletId.length === 18 ? palletId : "");
	w.put(1, 2, "OP", { field: "recordType" });
	w.put(3, 12, ctx.loadId, { field: "loadId" });
	w.put(13, 21, ssccRaw ? "" : palletId, { field: "palletId" });
	w.num(22, 26, formatInteger(sequence, 5), { field: "sequenceNumber" });
	w.put(27, 27, "P", { field: "unitType" });
	w.put(42, 43, h.destinationType || "PO", { field: "destinationType" });
	w.put(44, 50, h.destinationLocation || h.locationCode, { field: "destinationLocation" });
	w.put(51, 60, h.consignmentNumber, { field: "consignmentNumber" });
	w.put(61, 71, h.containerNumber, { field: "containerNumber" });
	w.put(72, 72, "N", { field: "containerSplit" });
	w.put(73, 73, h.channel || "E", { field: "channel" });
	w.put(74, 75, h.organisationCode, { field: "organisation" });
	w.put(76, 77, codeOrError(w, "country", v.country, 2, 76, 77, "country", row.excelRow), { field: "country" });
	w.put(78, 79, get("commGrp"), { field: "commGrp" });
	w.put(80, 81, get("commodity"), { field: "commodity" });
	w.put(82, 83, get("varGrp"), { field: "varGrp" });
	w.put(84, 86, get("variety"), { field: "variety" });
	w.put(87, 89, get("subVar"), { field: "subVar" });
	w.put(90, 92, get("actVar"), { field: "actVar" });
	w.put(93, 96, get("pack"), { field: "pack" });
	w.put(97, 100, get("grade"), { field: "grade" });
	w.put(101, 105, get("mark"), { field: "mark" });
	w.put(106, 110, get("sizeCount"), { field: "sizeCount" });
	w.put(111, 112, get("inventoryCode"), { field: "inventoryCode" });
	w.put(113, 116, get("pickRef"), { field: "pickRef" });
	w.put(117, 123, get("farm"), { field: "farm" });
	w.put(124, 125, get("prodGrp"), { field: "prodGrp" });
	w.put(126, 128, get("prodChar"), { field: "prodChar" });
	w.put(129, 130, get("targetMarket"), { field: "targetMarket" });
	w.num(131, 135, formatInteger(v.cartons, 5), { field: "cartons" });
	w.num(136, 144, formatInteger(v.palletQuantity ?? 1, 9), { field: "palletQuantity" });
	w.put(145, 145, "N", { field: "mixedIndicator" });
	w.put(146, 153, get("remarks"), { field: "remarks" });
	w.put(154, 157, get("reason"), { field: "reason" });
	const intake = dateOrError(w, v.originalIntakeDate, "originalIntakeDate", 173, 180, row.excelRow);
	w.put(158, 165, intake, { field: "intakeDate" });
	w.put(166, 172, h.locationCode, { field: "originalDepot" });
	w.put(173, 180, intake, { field: "originalIntakeDate" });
	w.put(181, 181, get("shift"), { field: "shift" });
	w.put(182, 189, dateOrError(w, v.shiftDate, "shiftDate", 182, 189, row.excelRow), { field: "shiftDate" });
	w.put(190, 195, "", { field: "orderNo" });
	w.put(196, 202, h.locationCode, { field: "locationCode" });
	w.put(203, 204, get("store"), { field: "store" });
	w.put(205, 206, get("stockPool"), { field: "stockPool" });
	w.put(207, 219, dateTimeOrError(w, v.shippedDate, "shippedDate", 207, 219, row.excelRow), { field: "shippedDate" });
	w.put(220, 220, "Y", { field: "transmitFlag" });
	w.num(221, 225, formatInteger(1, 5), { field: "revision" });
	w.put(241, 248, ctx.transactionDate, { field: "transactionDate" });
	w.put(249, 253, ctx.transactionTime, { field: "transactionTime" });
	w.put(254, 254, "S", { field: "palletBinType" });
	w.put(255, 264, get("origCons"), { field: "origCons" });
	w.put(265, 270, get("shipNumber"), { field: "shipNumber" });
	w.put(271, 276, v.temperature === null || v.temperature === void 0 || String(v.temperature).trim() === "" ? "" : formatDecimal(v.temperature, 6, 2), { field: "temperature" });
	w.put(277, 285, get("comboPalletId"), { field: "comboPalletId" });
	w.put(286, 305, get("tempDeviceId"), { field: "tempDeviceId" });
	w.put(306, 307, get("tempDeviceType"), { field: "tempDeviceType" });
	w.put(308, 313, get("boeNo"), { field: "boeNo" });
	w.put(314, 315, get("principal"), { field: "principal" });
	if (ssccRaw) {
		if (!isValidSSCC(ssccRaw)) w.errors.push({
			code: "INVALID_SSCC",
			severity: "error",
			message: "SSCC must contain exactly 18 digits.",
			recordType: "OP",
			excelRow: row.excelRow,
			field: "sscc",
			fromPosition: 316,
			toPosition: 333,
			expectedLength: 18,
			actualLength: ssccRaw.length,
			value: ssccRaw
		});
		w.put(316, 333, ssccRaw, { field: "sscc" });
	} else w.errors.push({
		code: "SSCC_BLANK",
		severity: "warning",
		message: "SSCC is blank; only a 9-character pallet ID was supplied.",
		recordType: "OP",
		excelRow: row.excelRow,
		field: "sscc",
		fromPosition: 316,
		toPosition: 333,
		value: palletId
	});
	w.num(334, 342, formatDecimal(v.nettMass, 9, 3), { field: "nettMass" });
	w.put(343, 358, get("saftbin1"), { field: "saftbin1" });
	w.put(359, 374, get("saftbin2"), { field: "saftbin2" });
	w.put(375, 390, get("saftbin3"), { field: "saftbin3" });
	w.put(391, 396, get("origAccount"), { field: "origAccount" });
	w.put(397, 404, dateOrError(w, v.inspectionDate, "inspectionDate", 397, 404, row.excelRow), { field: "inspectionDate" });
	w.put(405, 405, get("stackVariance"), { field: "stackVariance" });
	w.put(406, 406, get("storeType"), { field: "storeType" });
	w.put(407, 426, get("batchNo"), { field: "batchNo" });
	w.put(427, 436, get("waybillNo"), { field: "waybillNo" });
	w.put(437, 450, get("gtin"), { field: "gtin" });
	w.put(451, 457, get("packhouseCode"), { field: "packhouseCode" });
	w.put(458, 459, get("steriFlag"), { field: "steriFlag" });
	w.put(460, 461, get("steriDest"), { field: "steriDest" });
	w.put(462, 462, get("labelType"), { field: "labelType" });
	w.put(463, 463, get("provFlag"), { field: "provFlag" });
	w.put(464, 473, get("sellbyCode"), { field: "sellbyCode" });
	w.put(474, 491, get("comboSscc"), { field: "comboSscc" });
	w.put(492, 497, get("inspector"), { field: "inspector" });
	w.put(498, 503, get("inspectionPoint"), { field: "inspectionPoint" });
	w.put(504, 513, get("expiryCode"), { field: "expiryCode" });
	w.put(514, 528, get("orchard"), {
		field: "orchard",
		allowTruncate: true
	});
	w.put(529, 533, get("targetRegion"), { field: "targetRegion" });
	w.put(534, 535, codeOrError(w, "country", v.targetCountry, 2, 534, 535, "targetCountry", row.excelRow), { field: "targetCountry" });
	w.put(536, 555, get("globalGapNumber"), { field: "globalGapNumber" });
	w.put(556, 575, get("lotNo"), { field: "lotNo" });
	w.put(576, 595, get("traceabilityCode"), { field: "traceabilityCode" });
	w.put(596, 599, get("season"), { field: "season" });
	w.put(600, 607, dateOrError(w, v.origInspectionDate, "origInspectionDate", 600, 607, row.excelRow), { field: "originalInspectionDate" });
	w.put(608, 617, get("innerPack"), { field: "innerPack" });
	w.put(618, 622, v.innerCartons === null || v.innerCartons === void 0 || String(v.innerCartons).trim() === "" ? "" : formatInteger(v.innerCartons, 5), { field: "innerCartons" });
	w.put(623, 642, get("productionId"), { field: "productionId" });
	w.put(643, 644, get("protocolExceptionIndicator"), { field: "protocolExceptionIndicator" });
	w.put(645, 669, get("upn"), {
		field: "upn",
		allowTruncate: true
	});
	w.put(670, 699, get("palletTreatment"), {
		field: "palletTreatment",
		allowTruncate: true
	});
	if (sequence === 1) w.num(700, 709, formatDecimal(v.grossMass, 10, 3), { field: "palletGrossMass" });
	else w.put(700, 709, "", { field: "palletGrossMass" });
	w.put(710, 719, get("samsaAccreditation"), { field: "samsaAccreditation" });
	w.put(720, 726, get("weighingLocation"), { field: "weighingLocation" });
	w.put(727, 739, dateTimeOrError(w, v.weighingDateTime, "weighingDateTime", 727, 739, row.excelRow), { field: "weighingDateTime" });
	w.put(740, 741, get("mainArea"), { field: "mainArea" });
	w.put(742, 757, get("productionArea"), {
		field: "productionArea",
		allowTruncate: true
	});
	w.put(758, 767, get("phytoData"), {
		field: "phytoData",
		allowTruncate: true
	});
	w.put(768, 807, get("custOrd"), {
		field: "custOrd",
		allowTruncate: true
	});
	w.put(808, 817, get("reInspectionDocument"), { field: "reInspectionDocument" });
	w.put(818, 827, get("eLotKey"), { field: "eLotKey" });
	w.put(828, 837, get("agreementCode"), { field: "agreementCode" });
	w.put(838, 977, get("postTreatment"), {
		field: "postTreatment",
		allowTruncate: true
	});
	w.put(978, 997, get("referenceNumber"), { field: "referenceNumber" });
	w.put(998, 1012, get("eLotKey"), { field: "eLotKey" });
	if (!palletId && !ssccRaw) w.errors.push({
		code: "MISSING_REQUIRED_FIELD",
		severity: "error",
		message: "Pallet ID / barcode is required.",
		recordType: "OP",
		excelRow: row.excelRow,
		field: "palletId",
		fromPosition: 13,
		toPosition: 21
	});
	if (toNumber(v.cartons) === null) w.errors.push({
		code: "INVALID_NUMBER",
		severity: "error",
		message: "Carton quantity is missing or not numeric.",
		recordType: "OP",
		excelRow: row.excelRow,
		field: "cartons",
		fromPosition: 131,
		toPosition: 135,
		value: toPlainText(v.cartons)
	});
	const { line, errors } = w.done();
	return {
		recordType: "OP",
		line,
		errors,
		excelRow: row.excelRow
	};
}
function buildBTRecord(ctx, counts) {
	const h = ctx.header;
	const w = new RecordWriter(RECORD_LENGTHS.BT, "BT");
	w.put(1, 2, "BT", { field: "recordType" });
	w.put(3, 5, h.sourceAddress, { field: "sourceAddress" });
	w.num(6, 11, formatInteger(h.batchNumber, 6), { field: "batchNumber" });
	w.num(12, 18, formatInteger(counts.recordCount, 7), { field: "recordCount" });
	w.num(19, 23, formatInteger(counts.oh, 5), { field: "ohCount" });
	w.num(24, 28, formatInteger(counts.ol, 5), { field: "olCount" });
	w.num(29, 33, formatInteger(counts.oc, 5), { field: "ocCount" });
	w.num(34, 38, formatInteger(counts.ok, 5), { field: "okCount" });
	w.num(39, 43, formatInteger(counts.op, 5), { field: "opCount" });
	w.num(44, 51, formatInteger(counts.cartons, 8), { field: "cartonCount" });
	w.num(52, 60, formatInteger(counts.pallets, 9), { field: "palletCount" });
	const { line, errors } = w.done();
	return {
		recordType: "BT",
		line,
		errors
	};
}
function codeOrError(w, table, raw, maxLength, from, to, field, excelRow) {
	const { value, unknown } = lookupCode(table, raw, maxLength);
	if (unknown) w.errors.push({
		code: "UNKNOWN_CODE",
		severity: "error",
		message: `No code translation exists for "${String(raw)}".`,
		recordType: "OP",
		excelRow,
		field,
		fromPosition: from,
		toPosition: to,
		expectedLength: maxLength,
		value: String(raw ?? "")
	});
	return value;
}
function dateOrError(w, raw, field, from, to, excelRow) {
	if (raw === null || raw === void 0 || String(raw).trim() === "") return "";
	const formatted = formatPODate(raw);
	if (!formatted) {
		w.errors.push({
			code: "INVALID_DATE",
			severity: "error",
			message: `"${String(raw)}" is not a valid date (expected yyyymmdd).`,
			recordType: "OP",
			excelRow,
			field,
			fromPosition: from,
			toPosition: to,
			value: String(raw)
		});
		return "";
	}
	return formatted;
}
function dateTimeOrError(w, raw, field, from, to, excelRow) {
	if (raw === null || raw === void 0 || String(raw).trim() === "") return "";
	const formatted = formatPODateTime(raw);
	if (!formatted) return "";
	return formatted;
}
function joinWithCRLF(lines) {
	return lines.join("\r\n") + "\r\n";
}
function getNextSequenceNumber(header, previousCount = 0) {
	if (header.fileName?.trim()) return String(header.sequenceNumber ?? "").trim().padStart(3, "0");
	const baseSequence = String(header.sequenceNumber ?? "").trim() || String(header.batchNumber ?? "").trim() || "1";
	const parsed = Number.parseInt(baseSequence, 10);
	const next = Number.isNaN(parsed) ? 1 : parsed + previousCount;
	return String(next).padStart(3, "0");
}
function buildFileName(header, sequenceOverride) {
	if (header.fileName?.trim()) return header.fileName.trim();
	const seq = (sequenceOverride ?? getNextSequenceNumber(header)).padStart(3, "0");
	return `PO${String(header.sourceAddress || "000").trim().slice(0, 3).padEnd(3, "0")}${seq}.${String(header.destinationAddress || "000").trim().slice(0, 3).padEnd(3, "0")}`;
}
/**
* Creates a randomized list of sequence numbers.
*
* Example for five rows:
* [1, 3, 5, 2, 4]
*
* Every number from 1 to the row count is included once.
*/
function createRandomSequenceNumbers(count) {
	const sequenceNumbers = Array.from({ length: count }, (_, index) => index + 1);
	for (let currentIndex = sequenceNumbers.length - 1; currentIndex > 0; currentIndex--) {
		const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
		[sequenceNumbers[currentIndex], sequenceNumbers[randomIndex]] = [sequenceNumbers[randomIndex], sequenceNumbers[currentIndex]];
	}
	return sequenceNumbers;
}
/**
* Returns the barcode used for grouping rows.
*
* SSCC is used first.
* If the SSCC is blank, the pallet ID is used.
* If both are blank, the row is treated as unique.
*/
function getBarcodeKey(row, index) {
	const sscc = String(row.values.sscc ?? "").trim();
	const palletId = String(row.values.palletId ?? "").trim();
	return sscc || palletId || `__row__${index}`;
}
/**
* Assigns sequence numbers to all rows.
*
* Repeated barcodes receive a randomized sequence containing
* every number from 1 to the number of repeated rows.
*
* Unique barcodes always receive sequence 1.
*/
function assignRandomSequenceNumbers(rows) {
	const barcodeGroups = /* @__PURE__ */ new Map();
	rows.forEach((row, index) => {
		const barcodeKey = getBarcodeKey(row, index);
		const existingIndexes = barcodeGroups.get(barcodeKey) ?? [];
		existingIndexes.push(index);
		barcodeGroups.set(barcodeKey, existingIndexes);
	});
	const rowSequences = new Array(rows.length).fill(1);
	for (const rowIndexes of barcodeGroups.values()) {
		if (rowIndexes.length === 1) {
			rowSequences[rowIndexes[0]] = 1;
			continue;
		}
		const randomizedSequences = createRandomSequenceNumbers(rowIndexes.length);
		rowIndexes.forEach((rowIndex, groupIndex) => {
			rowSequences[rowIndex] = randomizedSequences[groupIndex];
		});
	}
	return rowSequences;
}
function generatePOFile(input) {
	const { conversionId, header, rows } = input;
	const logs = [];
	const log = (action, extra = {}, level = "info") => {
		logs.push({
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			level,
			conversionId,
			module: "po-generator",
			action,
			...extra
		});
	};
	log("Record generation started", { message: `${rows.length} pallet rows` });
	const ctx = makeContext(header);
	const cartonCount = rows.reduce((sum, row) => sum + (toNumber(row.values.cartons) ?? 0), 0);
	const palletCount = rows.length;
	const records = [];
	const rowSequences = assignRandomSequenceNumbers(rows);
	records.push(buildBHRecord(ctx));
	log("BH generated");
	records.push(buildOHRecord(ctx, palletCount, Math.round(cartonCount)));
	log("OH generated");
	records.push(buildOLRecord(ctx));
	log("OL generated");
	const includeOK = Boolean(ctx.header.containerNumber?.trim() || ctx.header.sealNumber?.trim());
	if (includeOK) {
		records.push(buildOKRecord(ctx, palletCount));
		log("OK generated");
	}
	records.push(buildOCRecord(ctx, palletCount, Math.round(cartonCount)));
	log("OC generated");
	rows.forEach((row, index) => {
		const sequenceNumber = rowSequences[index] ?? 1;
		records.push(buildOPRecord(ctx, row, sequenceNumber));
	});
	log("OP records generated", { message: `${rows.length} OP records` });
	const opCount = rows.length;
	const okCount = Number(includeOK);
	const recordCount = 5 + okCount + opCount;
	records.push(buildBTRecord(ctx, {
		recordCount,
		oh: 1,
		ol: 1,
		oc: 1,
		ok: okCount,
		op: opCount,
		cartons: Math.round(cartonCount),
		pallets: palletCount
	}));
	log("BT generated", { message: `record count ${recordCount}` });
	const recordLengths = records.map((record) => ({
		recordType: record.recordType,
		length: record.line.length,
		expected: RECORD_LENGTHS[record.recordType],
		ok: record.line.length === RECORD_LENGTHS[record.recordType]
	}));
	log("Record lengths validated");
	const issues = records.flatMap((record) => record.errors);
	recordLengths.forEach((recordLength, index) => {
		if (!recordLength.ok) issues.push({
			code: "INVALID_RECORD_LENGTH",
			severity: "error",
			message: `${recordLength.recordType} record must be exactly ${recordLength.expected} characters.`,
			recordType: recordLength.recordType,
			excelRow: records[index].excelRow,
			expectedLength: recordLength.expected,
			actualLength: recordLength.length
		});
	});
	const btCartons = Math.round(cartonCount);
	const opCartons = rows.reduce((sum, row) => sum + Math.round(toNumber(row.values.cartons) ?? 0), 0);
	if (btCartons !== opCartons) issues.push({
		code: "TOTALS_DO_NOT_BALANCE",
		severity: "error",
		message: `Carton totals do not agree (OP ${opCartons} vs BT ${btCartons}).`,
		recordType: "BT"
	});
	log("Totals validated", { message: `${opCartons} cartons, ${palletCount} pallets` });
	const errors = issues.filter((issue) => issue.severity === "error" || Boolean(input.treatWarningsAsErrors && issue.severity === "warning"));
	const warnings = issues.filter((issue) => issue.severity === "warning");
	const content = joinWithCRLF(records.map((record) => record.line));
	const fileName = buildFileName(header);
	log("Output file created", { message: fileName });
	return {
		conversionId,
		status: errors.length > 0 ? "Validation Failed" : "Completed",
		fileName,
		content,
		recordCount,
		palletCount,
		cartonCount: opCartons,
		errors,
		warnings,
		logs,
		recordLengths
	};
}
/** Backend orchestration for the Excel → PO conversion pipeline. */
var MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
function handleUpload(input) {
	const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
	if (!safeName.toLowerCase().endsWith(".xlsx")) throw new Error("Only .xlsx files are accepted.");
	if (input.fileSize > MAX_UPLOAD_BYTES) throw new Error("File exceeds the 20 MB upload limit.");
	const uploadId = newId("UPL");
	const inspection = inspectWorkbook(input.base64, input.sheetName);
	const suggestedHeaderValues = suggestHeaderValues(inspection.headers, inspection.previewRows);
	store.uploads.set(uploadId, {
		uploadId,
		fileName: safeName,
		fileSize: input.fileSize,
		base64: input.base64,
		uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
	});
	logEvent(uploadId, "upload", "File received", { message: safeName });
	logEvent(uploadId, "excel-reader", "Excel opened", { message: `${inspection.worksheets.length} worksheet(s)` });
	logEvent(uploadId, "excel-reader", "Worksheet selected", { message: inspection.sheetName });
	logEvent(uploadId, "excel-reader", "Headers detected", { message: inspection.headers.join(", ").slice(0, 400) });
	return {
		uploadId,
		fileName: safeName,
		fileSize: input.fileSize,
		uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
		suggestedMapping: suggestMapping(inspection.headers),
		suggestedHeaderValues,
		...inspection
	};
}
function inspectSheet(uploadId, sheetName) {
	const inspection = inspectWorkbook(requireUpload(uploadId).base64, sheetName);
	logEvent(uploadId, "excel-reader", "Worksheet selected", { message: inspection.sheetName });
	return {
		...inspection,
		suggestedMapping: suggestMapping(inspection.headers),
		suggestedHeaderValues: suggestHeaderValues(inspection.headers, inspection.previewRows)
	};
}
function requireUpload(uploadId) {
	const upload = store.uploads.get(uploadId);
	if (!upload) throw new Error("Upload not found or expired. Please upload the file again.");
	return upload;
}
function runConversion(input) {
	const upload = requireUpload(input.uploadId);
	const conversionId = newId("CNV");
	logEvent(conversionId, "conversion", "Mapping applied", { message: `${Object.keys(input.mapping).length} mapped fields` });
	const { headers, rows } = readSheetRows(upload.base64, input.sheetName);
	logEvent(conversionId, "excel-reader", "Rows parsed", { message: `${rows.length} rows` });
	const palletRows = applyMapping(rows, input.mapping, headers);
	logEvent(conversionId, "validation", "Validation started");
	const sequenceNumber = getNextSequenceNumber(input.header, store.conversions.size);
	const result = generatePOFile({
		conversionId,
		header: {
			...input.header,
			sequenceNumber
		},
		rows: palletRows,
		treatWarningsAsErrors: input.treatWarningsAsErrors
	});
	pushLogs(result.logs);
	logEvent(conversionId, "validation", "Validation completed", {
		message: `${result.errors.length} error(s), ${result.warnings.length} warning(s)`,
		level: result.errors.length ? "error" : "info"
	});
	const invalidRows = new Set(result.errors.filter((e) => e.excelRow !== void 0).map((e) => e.excelRow)).size;
	const record = {
		id: conversionId,
		status: result.status,
		sourceFileName: upload.fileName,
		outputFileName: result.fileName,
		selectedSheet: input.sheetName,
		totalRows: palletRows.length,
		validRows: palletRows.length - invalidRows,
		invalidRows,
		warningCount: result.warnings.length,
		recordCount: result.recordCount,
		palletCount: result.palletCount,
		cartonCount: result.cartonCount,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		completedAt: result.status === "Completed" ? (/* @__PURE__ */ new Date()).toISOString() : null,
		content: result.content,
		errors: result.errors,
		warnings: result.warnings,
		header: input.header,
		mapping: input.mapping
	};
	if (input.persist) store.conversions.set(conversionId, record);
	return {
		conversionId,
		status: result.status,
		fileName: result.fileName,
		recordCount: result.recordCount,
		palletCount: result.palletCount,
		cartonCount: result.cartonCount,
		totalRows: record.totalRows,
		validRows: record.validRows,
		invalidRows: record.invalidRows,
		errors: result.errors,
		warnings: result.warnings,
		recordLengths: result.recordLengths,
		logs: result.logs
	};
}
function requireConversion(id) {
	const conversion = store.conversions.get(id);
	if (!conversion) throw new Error("Conversion not found.");
	return conversion;
}
function buildValidationReport(id) {
	const c = requireConversion(id);
	const line = (i) => [
		i.severity.toUpperCase(),
		i.excelRow ?? "",
		i.recordType ?? "",
		i.field ?? "",
		i.code,
		i.fromPosition ? `${i.fromPosition}-${i.toPosition}` : "",
		i.value ?? "",
		i.message
	].join("	");
	const body = [
		`Validation report`,
		`Conversion ID: ${c.id}`,
		`Source file: ${c.sourceFileName}`,
		`Output file: ${c.outputFileName}`,
		`Status: ${c.status}`,
		`Rows: ${c.totalRows} (valid ${c.validRows}, invalid ${c.invalidRows})`,
		`Records: ${c.recordCount}  Pallets: ${c.palletCount}  Cartons: ${c.cartonCount}`,
		"",
		[
			"SEVERITY",
			"EXCEL ROW",
			"RECORD",
			"FIELD",
			"CODE",
			"POSITIONS",
			"VALUE",
			"MESSAGE"
		].join("	"),
		...c.errors.map(line),
		...c.warnings.map(line)
	];
	return {
		fileName: `${c.outputFileName.replace(/\.[^.]+$/, "")}-validation.txt`,
		content: body.join("\r\n") + "\r\n"
	};
}
//#endregion
export { buildValidationReport, handleUpload, inspectSheet, requireConversion, runConversion };
