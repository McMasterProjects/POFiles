import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { blankLine, setFixedWidthField } from "../lib/po/fixed-width";
import { parsePOText } from "../lib/po/po-parser";
import {
  convertedFileName,
  convertedWorkbook,
  convertedWorkbookFileName,
  STOCK_PALLET_HEADERS,
} from "../lib/po/po-to-excel";
import { validatePO } from "../lib/po/po-validation";

function record(type: string, length: number): string {
  return setFixedWidthField(blankLine(length), 1, 2, type).buffer;
}

function getStockRows(workbook: XLSX.WorkBook): unknown[][] {
  return XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["Stock Pallet"], {
    header: 1,
    raw: false,
    defval: "",
  });
}

function columnIndex(columnName: (typeof STOCK_PALLET_HEADERS)[number]): number {
  return STOCK_PALLET_HEADERS.indexOf(columnName);
}

describe("Open in Excel workflow", () => {
  it("extracts OP fields as text from the fixed-width positions", () => {
    let op = record("OP", 1012);

    op = setFixedWidthField(op, 13, 21, "000123456").buffer;

    op = setFixedWidthField(op, 22, 26, "00005").buffer;

    op = setFixedWidthField(op, 316, 333, "600123456789012345").buffer;

    op = setFixedWidthField(op, 407, 426, "00000000000000000001").buffer;

    const parsed = parsePOText(`${record("BH", 89)}\r\n` + `${op}\r\n` + `${record("BT", 60)}\r\n`);

    expect(parsed.pallets).toHaveLength(1);

    expect(parsed.pallets[0].palletId).toBe("000123456");

    expect(parsed.pallets[0].sequenceNumber).toBe("00005");

    expect(parsed.pallets[0].sscc).toBe("600123456789012345");

    expect(parsed.pallets[0].batchNumber).toBe("00000000000000000001");

    expect(validatePO(parsed).status).toBe("Valid");
  });

  it("reports unsupported records and invalid fixed-width lengths", () => {
    const parsed = parsePOText("ZZ invalid\r\nBH\r\n");

    const result = validatePO(parsed);

    expect(result.errors.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["UNSUPPORTED_RECORD_TYPE", "INVALID_RECORD_LENGTH", "MISSING_BT"]),
    );
  });

  it("exports the required sheet and preserves identifier cells as strings", () => {
    let op = record("OP", 1012);

    op = setFixedWidthField(op, 22, 26, "00001").buffer;

    op = setFixedWidthField(op, 316, 333, "600123456789012345").buffer;

    op = setFixedWidthField(op, 131, 135, "00090").buffer;

    op = setFixedWidthField(op, 136, 144, "000001.00").buffer;

    op = setFixedWidthField(op, 334, 342, "001125.000").buffer;

    op = setFixedWidthField(op, 700, 709, "001233.000").buffer;

    const ok = setFixedWidthField(record("OK", 240), 226, 240, "SEAL-SECONDARY").buffer;

    const oc = setFixedWidthField(record("OC", 240), 34, 41, "20260311").buffer;

    const parsed = parsePOText(`${ok}\r\n${oc}\r\n${op}\r\n`);

    const validation = validatePO(parsed);

    const workbook = convertedWorkbook(parsed, validation);

    expect(workbook.SheetNames).toEqual(["Stock Pallet"]);

    const stockRows = getStockRows(workbook);

    expect(stockRows[0]).toEqual(STOCK_PALLET_HEADERS);

    expect(stockRows[1][columnIndex("Sscc")]).toBe("600123456789012345");

    expect(stockRows[1][columnIndex("seal_number")]).toBe("SEAL-SECONDARY");

    expect(stockRows[1][columnIndex("stuff_date")]).toBe("2026/03/11");

    expect(stockRows[1][columnIndex("seq_no")]).toBe("1");

    expect(stockRows[1][columnIndex("ctn_qty")]).toBe("90.00");

    expect(stockRows[1][columnIndex("plt_qty")]).toBe("1.00");

    expect(stockRows[1][columnIndex("Actual Nett Weight")]).toBe("1125.00");

    expect(stockRows[1][columnIndex("Actual Gross Weight")]).toBe("1233.00");

    expect(convertedFileName("shipment.000")).toBe("shipment_converted.xlsx");
  });

  it("uses the PO filename for the downloaded workbook filename", () => {
    const originalPOFileName = "PO043275SA.000";

    const parsed = parsePOText(`${record("OK", 240)}\r\n`);

    expect(convertedWorkbookFileName(originalPOFileName, parsed)).toBe("PO043275SA_converted.xlsx");
  });

  it("does not use the container number for the downloaded workbook filename", () => {
    const originalPOFileName = "PO043275SA.000";
    const containerNumber = "MEDU9138884";

    const ok = setFixedWidthField(record("OK", 240), 20, 30, containerNumber).buffer;

    const parsed = parsePOText(`${ok}\r\n`);

    const workbookFileName = convertedWorkbookFileName(originalPOFileName, parsed);

    expect(workbookFileName).toBe("PO043275SA_converted.xlsx");

    expect(workbookFileName).not.toBe(`${containerNumber}.xlsx`);
  });

  it("exports each pallet with its own data instead of duplicating rows", () => {
    let op1 = record("OP", 1012);

    op1 = setFixedWidthField(op1, 22, 26, "00001").buffer;

    op1 = setFixedWidthField(op1, 316, 333, "600111111111111111").buffer;

    op1 = setFixedWidthField(op1, 131, 135, "00050").buffer;

    op1 = setFixedWidthField(op1, 136, 144, "000002.00").buffer;

    let op2 = record("OP", 1012);

    op2 = setFixedWidthField(op2, 22, 26, "00002").buffer;

    op2 = setFixedWidthField(op2, 316, 333, "600222222222222222").buffer;

    op2 = setFixedWidthField(op2, 131, 135, "00075").buffer;

    op2 = setFixedWidthField(op2, 136, 144, "000003.00").buffer;

    const ok = setFixedWidthField(record("OK", 240), 226, 240, "SEAL-PRIMARY").buffer;

    const oc = setFixedWidthField(record("OC", 240), 34, 41, "20260311").buffer;

    const parsed = parsePOText(`${ok}\r\n` + `${oc}\r\n` + `${op1}\r\n` + `${op2}\r\n`);

    const validation = validatePO(parsed);

    const workbook = convertedWorkbook(parsed, validation);

    const stockRows = getStockRows(workbook);

    // First pallet
    expect(stockRows[1][columnIndex("Sscc")]).toBe("600111111111111111");

    expect(stockRows[1][columnIndex("seq_no")]).toBe("1");

    expect(stockRows[1][columnIndex("ctn_qty")]).toBe("50.00");

    expect(stockRows[1][columnIndex("plt_qty")]).toBe("2.00");

    // Second pallet
    expect(stockRows[2][columnIndex("Sscc")]).toBe("600222222222222222");

    expect(stockRows[2][columnIndex("seq_no")]).toBe("2");

    expect(stockRows[2][columnIndex("ctn_qty")]).toBe("75.00");

    expect(stockRows[2][columnIndex("plt_qty")]).toBe("3.00");
  });

  it("keeps the original non-consecutive seq_no values from the PO file", () => {
    let op1 = record("OP", 1012);

    op1 = setFixedWidthField(op1, 22, 26, "00005").buffer;

    op1 = setFixedWidthField(op1, 316, 333, "600111111111111111").buffer;

    let op2 = record("OP", 1012);

    op2 = setFixedWidthField(op2, 22, 26, "00009").buffer;

    op2 = setFixedWidthField(op2, 316, 333, "600222222222222222").buffer;

    let op3 = record("OP", 1012);

    op3 = setFixedWidthField(op3, 22, 26, "00015").buffer;

    op3 = setFixedWidthField(op3, 316, 333, "600333333333333333").buffer;

    const parsed = parsePOText(`${op1}\r\n${op2}\r\n${op3}\r\n`);

    const validation = validatePO(parsed);

    const workbook = convertedWorkbook(parsed, validation);

    const stockRows = getStockRows(workbook);
    const seqColumn = columnIndex("seq_no");

    expect(stockRows[1][seqColumn]).toBe("5");
    expect(stockRows[2][seqColumn]).toBe("9");
    expect(stockRows[3][seqColumn]).toBe("15");

    // Confirm sequences were not regenerated as 1, 2 and 3.
    expect(stockRows.slice(1).map((row) => row[seqColumn])).toEqual(["5", "9", "15"]);
  });

  it("keeps duplicate seq_no values when they exist in the PO file", () => {
    let op1 = record("OP", 1012);

    op1 = setFixedWidthField(op1, 22, 26, "00003").buffer;

    op1 = setFixedWidthField(op1, 316, 333, "600111111111111111").buffer;

    let op2 = record("OP", 1012);

    op2 = setFixedWidthField(op2, 22, 26, "00003").buffer;

    op2 = setFixedWidthField(op2, 316, 333, "600222222222222222").buffer;

    const parsed = parsePOText(`${op1}\r\n${op2}\r\n`);

    const validation = validatePO(parsed);

    const workbook = convertedWorkbook(parsed, validation);

    const stockRows = getStockRows(workbook);
    const seqColumn = columnIndex("seq_no");

    expect(stockRows[1][seqColumn]).toBe("3");
    expect(stockRows[2][seqColumn]).toBe("3");
  });
});
