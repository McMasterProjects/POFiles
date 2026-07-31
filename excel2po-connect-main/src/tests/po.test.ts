import { describe, expect, it } from "vitest";
import { RecordWriter, setFixedWidthField, blankLine } from "../lib/po/fixed-width";
import {
  formatDecimal,
  formatInteger,
  formatPODate,
  formatPOTime,
  isValidSSCC,
  parseExcelDate,
  toPlainText,
} from "../lib/po/format";
import { buildFileName, generatePOFile, CRLF, getNextSequenceNumber } from "../lib/po/generator";
import { RECORD_LENGTHS } from "../lib/po/builders";
import type { POHeaderInput } from "../lib/po/types";

const header: POHeaderInput = {
  sourceAddress: "MTS",
  destinationAddress: "000",
  sequenceNumber: "0001",
  batchNumber: "465",
  locationCode: "CPT0001",
  containerNumber: "MSDU9721477",
  sealNumber: "ZA123456",
  consignmentNumber: "CONS000123",
  organisationCode: "GG",
  countryCode: "ZA",
  channel: "E",
  destinationType: "PO",
  destinationLocation: "CPT0001",
  provider: "MATES",
  version: "2.18",
};

const rows = [
  {
    excelRow: 2,
    values: {
      palletId: "000123456",
      sscc: "600123456789012345",
      cartons: 40,
      grossMass: 1409,
      nettMass: 1200,
      country: "South Africa",
      inspectionDate: "2026-01-14",
      originalIntakeDate: "20260110",
    },
  },
  {
    excelRow: 3,
    values: { palletId: "000123457", cartons: "20", country: "ZA" },
  },
];

describe("fixed-width helper", () => {
  it("writes alpha values left aligned and space padded", () => {
    const { buffer } = setFixedWidthField(blankLine(10), 1, 5, "AB");
    expect(buffer).toBe("AB        ");
  });

  it("writes numeric values right aligned with zero padding", () => {
    const { buffer } = setFixedWidthField(blankLine(6), 1, 5, "40", { align: "numeric" });
    expect(buffer).toBe("00040 ");
  });

  it("reports overflow instead of silently truncating", () => {
    const { errors } = setFixedWidthField(blankLine(10), 1, 3, "TOOLONG");
    expect(errors[0].code).toBe("INVALID_FIELD_LENGTH");
    expect(errors[0].actualLength).toBe(7);
  });

  it("never changes the record length", () => {
    const w = new RecordWriter(20, "XX");
    w.put(10, 20, "HELLO");
    expect(w.done().line.length).toBe(20);
  });
});

describe("formatting", () => {
  it("pads integers", () => expect(formatInteger(40, 5)).toBe("00040"));
  it("formats gross mass with 3 decimals", () =>
    expect(formatDecimal(1409, 10, 3)).toBe("001409.000"));
  it("preserves leading zeroes as text", () => expect(toPlainText("000123456")).toBe("000123456"));
  it("avoids scientific notation for long numbers", () =>
    expect(toPlainText(600123456789012345)).not.toMatch(/e\+/i));
  it("parses excel serial dates", () =>
    expect(formatPODate(parseExcelDate(45000))).toBe("20230315"));
  it("parses iso and text dates", () => {
    expect(formatPODate("2026-01-14")).toBe("20260114");
    expect(formatPODate("14/01/2026")).toBe("20260114");
  });
  it("rejects invalid dates", () => expect(formatPODate("not a date")).toBeNull());
  it("formats time as hh:mm", () =>
    expect(formatPOTime(new Date(Date.UTC(2026, 0, 1, 8, 5)))).toBe("08:05"));
  it("validates SSCC", () => {
    expect(isValidSSCC("600123456789012345")).toBe(true);
    expect(isValidSSCC("12345")).toBe(false);
  });
});

describe("file naming", () => {
  it("builds POMTS sequential file names", () => {
    expect(buildFileName({ ...header, fileName: undefined }, "0001")).toBe("POMTS0001.000");
    expect(buildFileName({ ...header, fileName: undefined }, "0002")).toBe("POMTS0002.000");
  });

  it("increments the next sequence number for subsequent generations", () => {
    expect(getNextSequenceNumber({ ...header, fileName: undefined }, 0)).toBe("0001");
    expect(getNextSequenceNumber({ ...header, fileName: undefined }, 1)).toBe("0002");
  });
});

describe("PO generation", () => {
  const result = generatePOFile({ conversionId: "TEST", header, rows });
  const lines = result.content.split(CRLF).filter(Boolean);

  it("produces the nested record sequence", () => {
    expect(lines.map((l) => l.slice(0, 2))).toEqual(["BH", "OH", "OL", "OK", "OC", "OP", "OP", "BT"]);
  });

  it("uses CRLF line endings", () => {
    expect(result.content).toContain(CRLF);
    expect(result.content.replace(/\r\n/g, "")).not.toContain("\n");
    expect(result.content.endsWith(CRLF)).toBe(true);
  });

  it("generates exact record lengths", () => {
    for (const line of lines) {
      const type = line.slice(0, 2) as keyof typeof RECORD_LENGTHS;
      expect(line.length).toBe(RECORD_LENGTHS[type]);
    }
  });

  it("OP is 1012 and BT is 60 characters", () => {
    expect(lines.find((l) => l.startsWith("OP"))!.length).toBe(1012);
    expect(lines.find((l) => l.startsWith("BT"))!.length).toBe(60);
  });

  it("places SSCC at 316-333 and blanks pallet id when SSCC exists", () => {
    const op = lines[5];
    expect(op.slice(315, 333)).toBe("600123456789012345");
    expect(op.slice(12, 21).trim()).toBe("");
  });

  it("places a 9 character pallet id at 13-21 and warns about blank SSCC", () => {
    const op = lines[6];
    expect(op.slice(12, 21)).toBe("000123457");
    expect(result.warnings.some((w) => w.code === "SSCC_BLANK")).toBe(true);
  });

  it("writes carton quantity zero padded at 131-135", () => {
    expect(lines[5].slice(130, 135)).toBe("00040");
  });

  it("assigns sequence numbers per repeated barcode and keeps unique rows at sequence 1", () => {
    const repeated = generatePOFile({
      conversionId: "T5",
      header,
      rows: [
        { excelRow: 2, values: { palletId: "000123456", sscc: "600123456789012345", cartons: 1, country: "ZA" } },
        { excelRow: 3, values: { palletId: "000123456", sscc: "600123456789012345", cartons: 1, country: "ZA" } },
        { excelRow: 4, values: { palletId: "000123457", cartons: 1, country: "ZA" } },
      ],
    });
    const opLines = repeated.content.split(CRLF).filter(Boolean).filter((line) => line.startsWith("OP"));

    expect(opLines[0].slice(21, 26)).toBe("00001");
    expect(opLines[1].slice(21, 26)).toBe("00002");
    expect(opLines[2].slice(21, 26)).toBe("00001");
  });

  it("writes gross mass with three decimals at 700-709", () => {
    expect(lines[5].slice(699, 709)).toBe("001409.000");
  });

  it("translates descriptive country values", () => {
    expect(lines[5].slice(75, 77)).toBe("ZA");
  });

  it("calculates BT counts dynamically", () => {
    const bt = lines[7];
    expect(bt.slice(11, 18)).toBe("0000008"); // 6 + 2 OP records
    expect(bt.slice(38, 43)).toBe("00002"); // OP count
    expect(bt.slice(43, 51)).toBe("00000060"); // cartons
    expect(result.recordCount).toBe(8);
    expect(result.cartonCount).toBe(60);
  });

  it("flags unknown descriptive codes", () => {
    const bad = generatePOFile({
      conversionId: "T2",
      header,
      rows: [{ excelRow: 2, values: { palletId: "000000001", cartons: 1, country: "Republic of Nowhere" } }],
    });
    expect(bad.errors.some((e) => e.code === "UNKNOWN_CODE")).toBe(true);
  });

  it("flags invalid dates with row, field and positions", () => {
    const bad = generatePOFile({
      conversionId: "T3",
      header,
      rows: [{ excelRow: 9, values: { palletId: "000000001", cartons: 1, inspectionDate: "nope" } }],
    });
    const err = bad.errors.find((e) => e.code === "INVALID_DATE")!;
    expect(err.excelRow).toBe(9);
    expect(err.recordType).toBe("OP");
    expect(err.field).toBe("inspectionDate");
    expect(err.fromPosition).toBe(397);
    expect(err.toPosition).toBe(404);
  });

  it("flags an over-long container number", () => {
    const bad = generatePOFile({
      conversionId: "T4",
      header: { ...header, containerNumber: "MSDU97214770" },
      rows,
    });
    expect(
      bad.errors.some((e) => e.code === "INVALID_FIELD_LENGTH" && e.field === "containerNumber"),
    ).toBe(true);
  });
});
