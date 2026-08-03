import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ColumnMapping, POHeaderInput } from "./types";

const headerSchema = z.object({
  sourceAddress: z.string().min(1).max(3),
  destinationAddress: z.string().max(3).default("000"),
  sequenceNumber: z.string().max(10).default(""),
  batchNumber: z.string().max(10).default("0"),
  loadId: z.string().max(10).optional(),
  loadReference: z.string().max(10).optional(),
  locationCode: z.string().max(7).default(""),
  containerNumber: z.string().max(11).default(""),
  sealNumber: z.string().max(15).default(""),
  consignmentNumber: z.string().max(10).default(""),
  organisationCode: z.string().max(2).default(""),
  countryCode: z.string().max(2).default("ZA"),
  channel: z.string().max(1).default("E"),
  destinationType: z.string().max(2).default("DP"),
  destinationLocation: z.string().max(7).default(""),
  stuffingDate: z.string().max(8).optional(),
  transactionDate: z.string().max(8).optional(),
  transactionTime: z.string().max(5).optional(),
  provider: z.string().max(30).default("MATES"),
  version: z.string().max(30).default("2.18"),
  fileName: z.string().max(60).optional(),
});

const conversionInput = z.object({
  uploadId: z.string().min(1),
  sheetName: z.string().min(1),
  mapping: z.record(z.string(), z.string().optional()),
  header: headerSchema,
  treatWarningsAsErrors: z.boolean().optional(),
});

export const uploadExcelFn = createServerFn({ method: "POST" })
  .inputValidator((data: { fileName: string; fileSize: number; base64: string }) =>
    z
      .object({
        fileName: z.string().min(1).max(200),
        fileSize: z.number().int().positive(),
        base64: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { handleUpload } = await import("./service.server");
    return handleUpload(data);
  });

export const selectSheetFn = createServerFn({ method: "POST" })
  .inputValidator((data: { uploadId: string; sheetName: string }) =>
    z.object({ uploadId: z.string(), sheetName: z.string() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { inspectSheet } = await import("./service.server");
    return inspectSheet(data.uploadId, data.sheetName);
  });

export const validateConversionFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => conversionInput.parse(data))
  .handler(async ({ data }) => {
    const { runConversion } = await import("./service.server");
    return runConversion({
      uploadId: data.uploadId,
      sheetName: data.sheetName,
      mapping: data.mapping as ColumnMapping,
      header: data.header as POHeaderInput,
      persist: false,
      treatWarningsAsErrors: data.treatWarningsAsErrors,
    });
  });

export const generateConversionFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => conversionInput.parse(data))
  .handler(async ({ data }) => {
    const { runConversion } = await import("./service.server");
    return runConversion({
      uploadId: data.uploadId,
      sheetName: data.sheetName,
      mapping: data.mapping as ColumnMapping,
      header: data.header as POHeaderInput,
      persist: true,
      treatWarningsAsErrors: data.treatWarningsAsErrors,
    });
  });

export const getConversionPreviewFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireConversion } = await import("./service.server");
    const c = requireConversion(data.id);
    return { fileName: c.outputFileName, content: c.content };
  });

export const getConversionReportFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { buildValidationReport } = await import("./service.server");
    return buildValidationReport(data.id);
  });

export const listConversionsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { store } = await import("./store.server");
  return [...store.conversions.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ content: _content, ...rest }) => rest);
});

export const listLogsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { store } = await import("./store.server");
  return store.logs.slice(-1000).reverse();
});

export const listMappingProfilesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { store } = await import("./store.server");
  return [...store.profiles.values()];
});

export const saveMappingProfileFn = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; mapping: Record<string, string | undefined> }) =>
    z
      .object({
        name: z.string().min(1).max(60),
        mapping: z.record(z.string(), z.string().optional()),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { store, newId } = await import("./store.server");
    const profile = {
      id: newId("MAP"),
      name: data.name,
      mapping: data.mapping as ColumnMapping,
      createdAt: new Date().toISOString(),
    };
    store.profiles.set(profile.id, profile);
    return profile;
  });

export const deleteMappingProfileFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { store } = await import("./store.server");
    store.profiles.delete(data.id);
    return { ok: true };
  });

export const healthFn = createServerFn({ method: "GET" }).handler(async () => {
  const { store } = await import("./store.server");
  return {
    status: "ok",
    version: "1.0.0",
    conversions: store.conversions.size,
    uploads: store.uploads.size,
    time: new Date().toISOString(),
  };
});
