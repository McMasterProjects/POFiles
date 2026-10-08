import { describe, expect, it } from "vitest";
import { RecordWriter, setFixedWidthField, blankLine } from "../lib/po/fixed-width";
import {
  formatDecimal,
  formatInteger,
  formatPODate,
  formatPODateTime,
  formatPOTime,
  isValidSSCC,
  parseExcelDate,
  toPlainText,
  validateAndFormatSSCC,
} from "../lib/po/format";
import {
  buildFileName,
  generatePOFile,
  CRLF,
  getNextSequenceNumber,
  summarizePalletGroups,
  resolveWeightSelection,
} from "../lib/po/generator";
import { RECORD_LENGTHS, buildOPRecord } from "../lib/po/builders";
import {
  getMappingOptionLabel,
  resolveBackendMapping,
  suggestMapping,
  suggestHeaderValues,
} from "../lib/po/mapping";
import {
  buildPODownloadSet,
  handleUpload,
  inferHeaderFromRows,
} from "../lib/po/service.server";
import type { POHeaderInput } from "../lib/po/types";
import { headerSchema } from "../lib/po/conversion.functions";
import { hydrateConversionRecords, store } from "../lib/po/store.server";

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
    values: {
      palletId: "000123457",
      cartons: "20",
      country: "ZA",
    },
  },
];

describe("legacy PO report helpers", () => {
  it("groups pallet rows by container and totals each container the way the report does", () => {
    const summary = summarizePalletGroups([
      { excelRow: 2, values: { containerNumber: "C1", cartons: 12, palletQuantity: 3, grossMass: 100 } },
      { excelRow: 3, values: { containerNumber: "C1", cartons: 8, palletQuantity: 2, grossMass: 50 } },
      { excelRow: 4, values: { containerNumber: "C2", cartons: 15, palletQuantity: 4, grossMass: 80 } },
    ] as any);

    expect(summary.groups.map((group) => group.container)).toEqual(["C1", "C2"]);
    expect(summary.groups[0].cartons).toBe(20);
    expect(summary.groups[0].palletQuantity).toBe(5);
    expect(summary.groups[1].cartons).toBe(15);
    expect(summary.totals.cartons).toBe(35);
    expect(summary.totals.palletQuantity).toBe(9);
  });

  it("chooses the correct print weight option for each record", () => {
    expect(resolveWeightSelection("Actual Weights", 120, 130, 140)).toBe(120);
    expect(resolveWeightSelection("Calculated Weights", 120, 130, 140)).toBe(130);
    expect(resolveWeightSelection("VGM Weights", 120, 130, 140)).toBe(140);
  });
});

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
    const writer = new RecordWriter(20, "XX");

    writer.put(10, 20, "HELLO");

    expect(writer.done().line.length).toBe(20);
  });

  it("preserves special characters in alpha values", () => {
    const { buffer } = setFixedWidthField(blankLine(8), 1, 8, "AB-12/3");

    expect(buffer).toBe("AB-12/3 ");
  });
});

describe("formatting", () => {
  it("pads integers", () => {
    expect(formatInteger(40, 5)).toBe("00040");
  });

  it("formats gross mass with 3 decimals", () => {
    expect(formatDecimal(1409, 10, 3)).toBe("001409.000");
  });

  it("preserves leading zeroes as text", () => {
    expect(toPlainText("000123456")).toBe("000123456");
  });

  it("avoids scientific notation for long numbers", () => {
    expect(toPlainText("600123456789012345")).not.toMatch(/e\+/i);
  });

  it("parses excel serial dates", () => {
    expect(formatPODate(parseExcelDate(45000))).toBe("20230315");
  });

  it("parses iso and text dates", () => {
    expect(formatPODate("2026-01-14")).toBe("20260114");
    expect(formatPODate("14/01/2026")).toBe("20260114");
  });

  it("rejects invalid dates", () => {
    expect(formatPODate("not a date")).toBeNull();
  });

  it("formats time as hh:mm", () => {
    expect(formatPOTime(new Date(Date.UTC(2026, 0, 1, 8, 5)))).toBe("08:05");
  });

  it("formats date-time values as yyyymmddhh:mm (spec)", () => {
    expect(formatPODateTime("2026-01-14")).toBe("2026011400:00");
    expect(formatPODateTime("2026011508:05")).toBe("2026011508:05");
    expect(formatPODateTime("202601150805")).toBe("2026011508:05");
  });

  it("validates SSCC", () => {
    expect(isValidSSCC("600123456789012345")).toBe(true);
    expect(isValidSSCC("12345")).toBe(false);
    expect(isValidSSCC("000123456")).toBe(false);
  });

  it("pads AO SSCC values to 18 characters and requires an organisation code", () => {
    expect(validateAndFormatSSCC("6001234567890123", "AO")).toEqual({
      success: true,
      value: "600123456789012300",
    });
    expect(validateAndFormatSSCC("6001234567890123", "")).toEqual({
      success: false,
      value: "6001234567890123",
      error: "Organisation code is required.",
    });
    expect(validateAndFormatSSCC("6001234567890123", "GG")).toEqual({
      success: false,
      value: "6001234567890123",
      error:
        "SSCC/barcode must contain exactly 18 characters for organisation GG. Received 16 characters.",
    });
  });

  it("falls back to a 18-digit barcode when SSCC is blank", () => {
    const record = buildOPRecord(
      {
        header,
        loadId: "LOAD123",
        batchNumber: "000001",
        fileSequence: "001",
        transactionDate: "20260114",
        transactionTime: "08:05",
      },
      {
        excelRow: 9,
        values: {
          palletId: "600123456789012345",
          sscc: "",
          cartons: 20,
          country: "ZA",
          nettMass: 1200,
        },
      },
      1,
    );

    expect(record.errors.some((error) => error.code === "INVALID_SSCC")).toBe(false);
    expect(record.line.slice(315, 333)).toContain("600123456789012345");
    expect(record.line.slice(12, 21).trim()).toBe("");
  });

  it("formats AO short pallet barcodes like the attached transmission", () => {
    const aoHeader = { ...header, organisationCode: "ao" };
    const record = buildOPRecord(
      {
        header: aoHeader,
        loadId: "LOAD123",
        batchNumber: "000001",
        fileSequence: "001",
        transactionDate: "20260408",
        transactionTime: "09:22",
      },
      {
        excelRow: 2,
        values: {
          palletId: "1302936",
          cartons: 76,
          nettMass: 475,
          grossMass: 521.143,
        },
      },
      1,
    );

    expect(record.errors.some((error) => error.code === "INVALID_SSCC")).toBe(false);
    expect(record.line.slice(73, 75)).toBe("AO");
    expect(record.line.slice(315, 333)).toBe("130293600000000000");
  });
});

describe("dashboard data normalization", () => {
  it("hydrates conversion records without leaking null values into the dashboard", () => {
    const id = "CNV-NULL-TEST";

    hydrateConversionRecords([
      {
        id,
        uploadId: "UP-1",
        status: null as any,
        sourceFileName: null as any,
        outputFileName: null as any,
        selectedSheet: "Sheet1",
        totalRows: null as any,
        validRows: null as any,
        invalidRows: null as any,
        warningCount: null as any,
        recordCount: null as any,
        palletCount: null as any,
        cartonCount: null as any,
        createdAt: null as any,
        completedAt: null,
        content: "",
        errors: null as any,
        warnings: null as any,
        header: null as any,
        mapping: null as any,
      },
    ]);

    const record = store.conversions.get(id)!;

    expect(record.status).toBe("Unknown");
    expect(record.sourceFileName).toBe("");
    expect(record.outputFileName).toBe("");
    expect(record.totalRows).toBe(0);
    expect(record.validRows).toBe(0);
    expect(record.invalidRows).toBe(0);
    expect(record.warningCount).toBe(0);
    expect(record.recordCount).toBe(0);
    expect(record.palletCount).toBe(0);
    expect(record.cartonCount).toBe(0);
    expect(record.createdAt).toBeTypeOf("string");
    expect(Array.isArray(record.errors)).toBe(true);
    expect(Array.isArray(record.warnings)).toBe(true);
  });
});

describe("file naming", () => {
  it("builds Paltrack fixed-width file names", () => {
    expect(
      buildFileName(
        {
          ...header,
          fileName: undefined,
        },
        "001",
      ),
    ).toBe("POMTS001.000");

    expect(
      buildFileName(
        {
          ...header,
          fileName: undefined,
        },
        "002",
      ),
    ).toBe("POMTS002.000");
  });

  it("increments the next sequence number for subsequent generations", () => {
    expect(
      getNextSequenceNumber(
        {
          ...header,
          fileName: undefined,
        },
        0,
      ),
    ).toBe("001");

    expect(
      getNextSequenceNumber(
        {
          ...header,
          fileName: undefined,
        },
        1,
      ),
    ).toBe("002");
  });
});

describe("header validation", () => {
  it("strips the removed loadId field from accepted header data", () => {
    const parsed = headerSchema.parse({
      sourceAddress: "MTS",
      destinationAddress: "000",
      sequenceNumber: "0001",
      batchNumber: "465",
      loadId: "LOAD123",
      loadReference: "REF123",
    });

    expect(parsed).not.toHaveProperty("loadId");
    expect(parsed.loadReference).toBe("REF123");
  });

  it("accepts load references that fit the PO name field width", () => {
    const parsed = headerSchema.parse({
      sourceAddress: "MTS",
      destinationAddress: "000",
      sequenceNumber: "0001",
      batchNumber: "465",
      loadReference: "THIS_IS_A_VALID_LOAD_REF",
    });

    expect(parsed.loadReference).toBe("THIS_IS_A_VALID_LOAD_REF");
  });

  it("rejects load references longer than the PO name field width", () => {
    expect(() =>
      headerSchema.parse({
        sourceAddress: "MTS",
        destinationAddress: "000",
        sequenceNumber: "0001",
        batchNumber: "465",
        loadReference: "THIS_IS_A_LOAD_REFERENCE_THAT_IS_TOO_LONG",
      }),
    ).toThrow();
  });
});

describe("record retention and export format", () => {
  it("accepts AO fixed-width transmissions and maps their OP rows", () => {
    const aoRecord = buildOPRecord(
      {
        header: { ...header, organisationCode: "AO" } as any,
        loadId: "002-000972",
        batchNumber: "000972",
        fileSequence: "001",
        transactionDate: "20260408",
        transactionTime: "09:22",
      } as any,
      {
        excelRow: 2,
        values: { sscc: "1302936", cartons: 475, country: "ZA" },
      },
      1,
    );
    const ocRecord = setFixedWidthField(blankLine(220), 20, 21, "AO").buffer;
    const base64 = Buffer.from(`${ocRecord}\n${aoRecord.line}\n`).toString("base64");
    const result = handleUpload({
      fileName: "PO002972.000",
      fileSize: Buffer.byteLength(Buffer.from(base64, "base64")),
      base64,
    });

    expect(result.rowCount).toBe(1);
    expect(result.suggestedHeaderValues.organisationCode).toBe("AO");
    expect(result.previewRows[0].sscc).toMatch(/^1302936\d{11}$/);
  });

  it("hydrates conversion records so dashboard data is not lost on refresh", () => {
    const snapshot = [{
      id: "CNV-REFRESH-01",
      uploadId: "UPL-REFRESH-01",
      status: "Completed",
      sourceFileName: "sample.xlsx",
      outputFileName: "POMTS001.00",
      selectedSheet: "Sheet1",
      totalRows: 2,
      validRows: 2,
      invalidRows: 0,
      warningCount: 0,
      recordCount: 3,
      palletCount: 2,
      cartonCount: 30,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      content: "PO DATA",
      errors: [],
      warnings: [],
      header: {},
      mapping: {},
    }];

    hydrateConversionRecords(snapshot as any);

    expect(store.conversions.get("CNV-REFRESH-01")?.content).toBe("PO DATA");
    expect(store.conversions.get("CNV-REFRESH-01")?.outputFileName).toBe("POMTS001.00");
  });

  it("creates a plain-text Notepad PO download only", () => {
    const downloads = buildPODownloadSet("POMTS001.00", "PO LINE 1\r\nPO LINE 2");

    expect(downloads.notepad.fileName).toBe("POMTS001.txt");
    expect(downloads).not.toHaveProperty("excel");
    expect(downloads.notepad.content).toContain("PO LINE 1");
  });

  it("totals pallet counts from pallet quantity values instead of row count", () => {
    const result = generatePOFile({
      conversionId: "CNV-TEST-1",
      header,
      rows: [
        {
          excelRow: 2,
          values: {
            palletId: "P0001",
            cartons: 40,
            palletQuantity: 3,
            country: "ZA",
            nettMass: 1200,
          },
        },
        {
          excelRow: 3,
          values: {
            palletId: "P0002",
            cartons: 20,
            palletQuantity: 2,
            country: "ZA",
            nettMass: 1200,
          },
        },
      ],
    });

    expect(result.palletCount).toBe(5);
    expect(result.cartonCount).toBe(60);
  });
});

describe("backend mapping", () => {
  it("preserves separate barcode and pallet number mappings", () => {
    const effective = resolveBackendMapping({
      palletId: "Pallet Number",
      sscc: "Barcode",
    });

    expect(effective.palletId).toBe("Pallet Number");
    expect(effective.sscc).toBe("Barcode");
  });

  it("suggests barcode and pallet number as separate fields", () => {
    const mapping = suggestMapping(["SSCC", "Barcode", "Pallet Number", "Cartons"]);

    expect(mapping.palletId).toBe("Pallet Number");
    expect(mapping.sscc).toBe("SSCC");
  });

  it("adds a clearer display label for known header aliases", () => {
    expect(getMappingOptionLabel("ctn_qty", "cartons")).toBe("ctn_qty — Carton Quantity");
    expect(getMappingOptionLabel("Actual Gross Weight", "grossMass")).toBe(
      "Actual Gross Weight — Pallet Gross Mass",
    );
    expect(getMappingOptionLabel("Country", "country")).toBe("Country");
  });

  it("suggests PO header values for load and location fields", () => {
    const headers = [
      "Load ID",
      "Load Reference",
      "Location Code",
      "Seal Number",
      "Organisation Code",
      "Stuff Date",
      "Container Number",
    ];
    const previewRows = [
      {
        "Load ID": "LOAD123",
        "Load Reference": "REF123",
        "Location Code": "CPT0001",
        "Seal Number": "ZA123456",
        "Organisation Code": "GJ",
        "Stuff Date": "20260114",
        "Container Number": "MSDU9721477",
      },
    ];

    const suggested = suggestHeaderValues(headers, previewRows);

    expect(suggested).not.toHaveProperty("loadId");
    expect(suggested.loadReference).toBe("REF123");
    expect(suggested.locationCode).toBe("CPT0001");
    expect(suggested.sealNumber).toBe("ZA123456");
    expect(suggested.organisationCode).toBe("GG");
    expect(suggested.stuffingDate).toBe("20260114");
  });

  it("infers sealNumber from row data when PO header input is blank", () => {
    const headers = ["Seal Number", "Container Number", "Load ID"];
    const rows = [
      { "Seal Number": "ZA123456", "Container Number": "MSDU9721477", "Load ID": "LOAD123" },
    ];

    const inferred = inferHeaderFromRows(headers, rows);

    expect(inferred.sealNumber).toBe("ZA123456");
  });

  it("maps the supplied warehouse headers when they are present", () => {
    const headers = [
      "container",
      "Sscc",
      "ctn_qty",
      "plt_qty",
      "Actual Gross Weight",
      "Actual Nett Weight",
      "Season",
      "locn_code",
      "orgzn",
      "stuff_date",
      "commodity",
      "variety",
      "grade",
      "pack",
      "size_count",
      "mark",
      "targ_mkt",
      "country",
      "farm",
      "Packh_code",
      "Orchard",
      "Inspec_date",
      "Inspect_pnt",
      "Inspector",
      "orig_intake",
      "cons_no",
      "temp_device_id",
      "inv_code",
      "Phyto_data",
      "UPN",
      "record type",
      "load_id",
      "pallet_id",
      "seq_no",
      "unit_type",
      "position",
      "sender",
      "agent",
      "ship_sender",
      "ship_agent",
      "dest_type",
      "dest_locn",
      "cont_split",
      "channel",
      "comm_grp",
      "var_grp",
      "sub_var",
      "act_var",
      "pick_ref",
      "prod_grp",
      "prod_char",
      "Calc Plt Qty",
      "mixed_ind",
      "remarks",
      "reason",
      "intake_date",
      "orig_depot",
      "shift",
      "shift_date",
      "order_no",
      "store",
      "stock_pool",
      "shipped_date",
      "xmit_flag",
      "revision",
      "mesg_no",
      "tran_user",
      "tran_date",
      "tran_time",
      "pallet_btype",
      "orig_cons",
      "ship number",
      "temperature",
      "combo_pallet_id",
      "temp_device_type",
      "boe_no",
      "principal",
      "mass",
      "Saftbin1",
      "Saftbin2",
      "Saftbin3",
      "Orig_account",
      "Re-Inspection Date",
      "Stack_variance",
      "Store_type",
      "Batch_no",
      "Waybill_no",
      "Gtin",
      "Steri_flag",
      "Steri_dest",
      "Label_type",
      "Prov Flag",
      "SellbyCode",
      "Combo_sscc",
      "Expiry_code",
      "Target_region",
      "Target_country",
      "Global_gap_number",
      "Lot no",
      "Traceability_code",
      "Orig_inspec_date",
      "Inner_pack",
      "Inner_cartons",
      "Production_id",
      "Protocol_exception_indicator",
      "Original Document Number",
      "Pallet_treatment",
      "Weighing Location",
      "Weighing Date Time",
      "Main Area",
      "Production Area",
      "location_type",
      "document_number",
      "actual_grade",
      "intake_time",
      "intake_point",
      "pallet_marks",
      "ctn_qtyrej",
      "ctn_qtydiscarded",
      "ctn_qtyeval",
      "loading_port",
      "load_ref",
      "shipped_time",
      "consec_no",
      "seal_number",
      "stuff_time",
      "load_depot",
      "calc_method",
      "temp_min",
      "temp_max",
      "invoiced",
      "cont_type",
      "container_ref",
      "container_size",
      "ship_line",
      "SamsaAccredit(Pallet)",
      "SamsaAccredit(Container)",
      "ContainerTareWeight",
      "ContainerGrossMass",
      "Validated",
      "Exception",
      "Exception Message",
      "Count of Exceptions",
      "EDI File Log No",
      "ID",
      "Processed",
      "Processed DateTime",
      "Processed User",
      "Intake Age",
      "Inspection Age",
      "Stock Status",
      "Reconciled",
      "Unverified",
      "PS EDI File Name",
      "PS EDI File DateTime",
      "Last Modified",
      "Reference No",
      "Created Date",
      "Actual Nett Weight Exists",
      "Actual Gross Weight Exists",
      "Check Weight",
      "Original seq_no",
      "Calc Equiv Ctn",
      "Cust_ord",
      "Re_inspec_doc",
      "PM Orig SSCC",
      "PM Orig Seq",
      "PM Qty Reduced",
      "PM ID",
      "Blocked for Updates",
      "Date Blocked for Updates",
      "UserID Blocked for Updates",
      "client_ref",
      "Client Reference",
      "Pack House Name",
    ];

    const mapping = suggestMapping(headers);

    expect(mapping.palletId).toBe("pallet_id");
    expect(mapping.sscc).toBe("Sscc");
    expect(mapping.cartons).toBe("ctn_qty");
    expect(mapping.palletQuantity).toBe("plt_qty");
    expect(mapping.grossMass).toBe("Actual Gross Weight");
    expect(mapping.nettMass).toBe("Actual Nett Weight");
    expect(mapping.season).toBe("Season");
    expect(mapping.commodity).toBe("commodity");
    expect(mapping.variety).toBe("variety");
    expect(mapping.grade).toBe("grade");
    expect(mapping.pack).toBe("pack");
    expect(mapping.sizeCount).toBe("size_count");
    expect(mapping.mark).toBe("mark");
    expect(mapping.targetMarket).toBe("targ_mkt");
    expect(mapping.country).toBe("country");
    expect(mapping.farm).toBe("farm");
    expect(mapping.packhouseCode).toBe("Packh_code");
    expect(mapping.orchard).toBe("Orchard");
    expect(mapping.inspectionDate).toBe("Inspec_date");
    expect(mapping.inspectionPoint).toBe("Inspect_pnt");
    expect(mapping.inspector).toBe("Inspector");
    expect(mapping.originalIntakeDate).toBe("orig_intake");
    expect(mapping.upn).toBe("UPN");
    expect(mapping.phytoData).toBe("Phyto_data");
    expect(mapping.productionArea).toBe("Production Area");
    expect(mapping.inventoryCode).toBe("inv_code");
  });
});

describe("PO generation", () => {
  const result = generatePOFile({
    conversionId: "TEST",
    header,
    rows,
  });

  const lines = result.content.split(CRLF).filter(Boolean);

  it("produces the nested record sequence", () => {
    expect(lines.map((line) => line.slice(0, 2))).toEqual([
      "BH",
      "OH",
      "OL",
      "OK",
      "OC",
      "OP",
      "OP",
      "BT",
    ]);
  });

  it("uses CRLF line endings", () => {
    expect(result.content).toContain(CRLF);

    expect(result.content.replace(/\r\n/g, "")).not.toContain("\n");

    expect(result.content.endsWith(CRLF)).toBe(true);
  });

  it("writes BH and OH fields into the documented positions", () => {
    const [bh, oh] = lines.slice(0, 2);

    expect(bh.slice(2, 5)).toBe("MTS");
    expect(bh.slice(5, 11)).toBe("000001");
    expect(oh.slice(2, 12).trim()).toBe("MTS-000001");
    expect(oh.slice(12, 22).trim()).toBe("MTS-000001");
  });

  it("generates exact record lengths", () => {
    for (const line of lines) {
      const type = line.slice(0, 2) as keyof typeof RECORD_LENGTHS;

      expect(line.length).toBe(RECORD_LENGTHS[type]);
    }
  });

  it("OP is 1012 and BT is 60 characters", () => {
    expect(lines.find((line) => line.startsWith("OP"))!.length).toBe(1012);

    expect(lines.find((line) => line.startsWith("BT"))!.length).toBe(60);
  });

  it("places SSCC at 316-333 and blanks pallet id when SSCC exists", () => {
    const op = lines[5];

    expect(op.slice(315, 333)).toBe("600123456789012345");

    expect(op.slice(12, 21).trim()).toBe("");
  });

  it("places a 18 character pallet id at 13-21 and warns about blank SSCC", () => {
    const op = lines[6];

    expect(op.slice(12, 21)).toBe("000123457");

    expect(result.warnings.some((warning) => warning.code === "SSCC_BLANK")).toBe(true);
  });

  it("writes carton quantity zero padded at 131-135", () => {
    expect(lines[5].slice(130, 135)).toBe("00040");
  });

  it("assigns sequence numbers per repeated barcode and keeps unique rows at sequence 1", () => {
    const repeated = generatePOFile({
      conversionId: "T5",
      header,
      rows: [
        {
          excelRow: 3,
          values: {
            palletId: "000123456",
            sscc: "600123456789012345",
            cartons: 1,
            country: "ZA",
          },
        },
        {
          excelRow: 2,
          values: {
            palletId: "000123456",
            sscc: "600123456789012345",
            cartons: 1,
            country: "ZA",
          },
        },
        {
          excelRow: 4,
          values: {
            palletId: "000123457",
            cartons: 1,
            country: "ZA",
          },
        },
      ],
    });

    const opLines = repeated.content
      .split(CRLF)
      .filter(Boolean)
      .filter((line) => line.startsWith("OP"));

    const repeatedSequences = opLines
      .filter((line) => line.slice(315, 333) === "600123456789012345")
      .map((line) => line.slice(21, 26))
      .sort();

    const uniquePalletLine = opLines.find((line) => line.slice(12, 21) === "000123457");

    expect(repeatedSequences).toEqual(["00001", "00002"]);

    expect(uniquePalletLine).toBeDefined();

    expect(uniquePalletLine!.slice(21, 26)).toBe("00001");
  });

  it("writes gross mass with three decimals at 700-709", () => {
    expect(lines[5].slice(699, 709)).toBe("001409.000");
  });

  it("writes document-defined OP values into their fixed-width positions", () => {
    const generated = generatePOFile({
      conversionId: "T6",
      header,
      rows: [
        {
          excelRow: 2,
          values: {
            palletId: "000000001",
            cartons: 1,
            country: "ZA",
            commGrp: "PF",
            varGrp: "BG",
            subVar: "GR",
            actVar: "GRS",
            pickRef: "PICK",
            prodGrp: "PD",
            prodChar: "CHR",
            
            remarks: "REMARKS",
            reason: "REAS",
            shift: "D",
            shiftDate: "2026/07/23",
            store: "ST",
            stockPool: "CE",
            shippedDate: "2026/07/23",
            origCons: "OC12345678",
            shipNumber: "200045", 
            temperature: 2.5,
            comboPalletId: "000000001",
            tempDeviceId: "SENSITECH1234567890",
            tempDeviceType: "ST",
            boeNo: "BOE123",
            principal: "CA",
            saftbin1: "SAFTBIN1VALUE",
            saftbin2: "SAFTBIN2VALUE",
            saftbin3: "SAFTBIN3VALUE",
            origAccount: "ACC001",
            stackVariance: "Y",
            storeType: "F",
            batchNo: "BATCH0001",
            waybillNo: "WAYBILL01",
            gtin: "12345678901234",
            steriFlag: "SF",
            steriDest: "SD",
            labelType: "L",
            provFlag: "Y",
            sellbyCode: "SELL001",
            comboSscc: "600123456789012345",
            expiryCode: "EXPIRY001",
            targetRegion: "REG01",
            globalGapNumber: "GG0000000000000001",
            lotNo: "LOT0000000000000001",
            traceabilityCode: "TRC0000000000000001",
            origInspectionDate: "20260116",
            innerPack: "INNERPACK",
            innerCartons: 3,
            productionId: "PRODUCTION001",
            protocolExceptionIndicator: "PI",
            custOrd: "CUSTOMERORDER0000000001",
            reInspectionDocument: "RINSP001",
            agreementCode: "AGREEMENT",
            postTreatment: "POSTTREATMENT",
            referenceNumber: "REFERENCE001",
            eLotKey: "ELOT001",
            palletTreatment: "IPPC TREATMENT",
            weighingLocation: "WEIGH01",
            weighingDateTime: "202601150805",
            mainArea: "MA",
            actualGrade: "1A",
          },
        },
      ],
    });

    const op = generated.content.split(CRLF).find((line) => line.startsWith("OP"));

    expect(op).toBeDefined();
    expect(op!.slice(77, 79)).toBe("PF");
    expect(op!.slice(112, 116)).toBe("PICK");
    expect(op!.slice(190, 195)).toBe("     ");
    expect(op!.slice(253, 254)).toBe("S");
    expect(op!.slice(313, 315)).toBe("CA");
    expect(op!.slice(599, 603)).toBe("2026");
    expect(op!.slice(767, 777)).toBe("CUSTOMEROR");
  });

  it("translates descriptive country values", () => {
    expect(lines[5].slice(75, 77)).toBe("ZA");
  });

  it("calculates BT counts dynamically", () => {
    const bt = lines[7];

    expect(bt.slice(11, 18)).toBe("0000008");
    expect(bt.slice(38, 43)).toBe("00002");
    expect(bt.slice(43, 51)).toBe("00000060");
    expect(result.recordCount).toBe(8);
    expect(result.cartonCount).toBe(60);
  });

  it("flags unknown descriptive codes", () => {
    const bad = generatePOFile({
      conversionId: "T2",
      header,
      rows: [
        {
          excelRow: 2,
          values: {
            palletId: "000000001",
            cartons: 1,
            country: "Republic of Nowhere",
          },
        },
      ],
    });

    expect(bad.errors.some((error) => error.code === "UNKNOWN_CODE")).toBe(true);
  });

  it("flags invalid dates with row, field and positions", () => {
    const bad = generatePOFile({
      conversionId: "T3",
      header,
      rows: [
        {
          excelRow: 9,
          values: {
            palletId: "000000001",
            cartons: 1,
            inspectionDate: "nope",
          },
        },
      ],
    });

    const error = bad.errors.find((item) => item.code === "INVALID_DATE")!;

    expect(error.excelRow).toBe(9);
    expect(error.recordType).toBe("OP");
    expect(error.field).toBe("inspectionDate");
    expect(error.fromPosition).toBe(397);
    expect(error.toPosition).toBe(404);
  });

  it("omits OK record when no container fields are present", () => {
    const noOKHeader = {
      ...header,
      containerNumber: "",
      sealNumber: "",
    };

    const result = generatePOFile({
      conversionId: "T8",
      header: noOKHeader,
      rows: [
        {
          excelRow: 2,
          values: {
            palletId: "000123458",
            cartons: 10,
            country: "ZA",
          },
        },
      ],
    });

    const lines = result.content.split(CRLF).filter(Boolean);
    expect(lines.map((line) => line.slice(0, 2))).toEqual(["BH", "OH", "OL", "OC", "OP", "BT"]);
    expect(result.recordCount).toBe(6);
    expect(lines.find((line) => line.startsWith("OK"))).toBeUndefined();
  });

  it("accepts valid 13-character date-time strings without reporting an error", () => {
    const bad = generatePOFile({
      conversionId: "T5",
      header,
      rows: [
        {
          excelRow: 10,
          values: {
            palletId: "000000001",
            cartons: 1,
            shippedDate: "2026/07/23",
          },
        },
      ],
    });

    const op = bad.content.split(CRLF).find((line) => line.startsWith("OP"));

    expect(op).toBeDefined();
    expect(bad.errors.some((error) => error.code === "INVALID_DATE")).toBe(false);
    expect(op!.slice(206, 219).trim()).toBe("2026/07/23");
  });

  it("flags an over-long container number", () => {
    const bad = generatePOFile({
      conversionId: "T4",
      header: {
        ...header,
        containerNumber: "MSDU97214770",
      },
      rows,
    });

    expect(
      bad.errors.some(
        (error) => error.code === "INVALID_FIELD_LENGTH" && error.field === "containerNumber",
      ),
    ).toBe(true);
  });

  it("rejects alpha overflow and preserves sign in decimals", () => {
    const longProvider = "P".repeat(80);
    const res = generatePOFile({
      conversionId: "T7",
      header: {
        ...header,
        provider: longProvider,
      },
      rows: [
        {
          excelRow: 2,
          values: {
            palletId: "000000001",
            cartons: 1,
            nettMass: -12.345,
            country: "ZA",
          },
        },
      ],
    });

    // BH provider field is 30 characters wide (30-59); overflow is rejected.
    expect(
      res.errors.some(
        (error) => error.code === "INVALID_FIELD_LENGTH" && error.field === "provider",
      ),
    ).toBe(true);

    // Negative decimal preserved with sign and fitted into 10 chars with 3 decimals
    const op = res.content.split(CRLF).find((l) => l.startsWith("OP"));
    expect(op).toBeDefined();
    // nettMass at 334-342 (18 characters in spec here) — ensure '-' present
    const nett = op!.slice(333, 342);
    expect(nett.includes("-")).toBe(true);
  });
});
