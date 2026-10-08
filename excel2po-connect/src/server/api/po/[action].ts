import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import {
  handleUpload,
  inspectSheet,
  runConversion,
  requireConversion,
  buildValidationReport,
} from "../../../lib/po/service.server";
import { store, newId } from "../../../lib/po/store.server";
import { conversionInput } from "../../../lib/po/conversion.functions";
import type { MappingProfile } from "../../../lib/po/store.server";

interface ErrorOptions {
  statusCode: number;
  statusMessage: string;
}

interface CustomError extends Error {
  statusCode: number;
  statusMessage: string;
}

interface EventNode {
  req: IncomingMessage;
  res: ServerResponse;
}

interface ApiEvent {
  body?: unknown;
  node?: EventNode;
  context?: {
    params?: {
      action?: unknown;
    };
  };
}

interface UploadBody {
  fileName: string;
  fileSize: number;
  base64: string;
  sheetName?: string;
}

interface SelectSheetBody {
  uploadId: string;
  sheetName: string;
}

interface PreviewBody {
  id: string;
}

interface ReportBody {
  id: string;
}

interface ProfilesBody {
  name: string;
  mapping: Record<string, string | undefined>;
}

interface ProfilesDeleteBody {
  id: string;
}

interface HealthResponse {
  status: string;
  conversions: number;
  uploads: number;
}

interface PreviewResponse {
  fileName: string;
  content: unknown;
}

interface ProfilesDeleteResponse {
  ok: boolean;
}

interface OptionsResponse {
  status: string;
}

function createError(options: ErrorOptions): CustomError {
  const error = new Error(options.statusMessage) as CustomError;
  error.statusCode = options.statusCode;
  error.statusMessage = options.statusMessage;
  return error;
}

function defineEventHandler<T>(handler: T): T {
  return handler;
}

async function readBody(event: ApiEvent): Promise<unknown> {
  if (event.body !== undefined) return event.body;

  const request = event.node?.req;
  if (!request) return undefined;

  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk: Buffer | string) => {
      raw += Buffer.isBuffer(chunk) ? chunk.toString("utf8") : chunk;
    });
    request.on("end", () => {
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function requireActionParam(event: ApiEvent): string {
  const action = event.context?.params?.action;
  if (!action || typeof action !== "string") {
    throw createError({ statusCode: 404, statusMessage: "API path not found." });
  }
  return action;
}

function requireNode(event: ApiEvent): EventNode {
  const node = event.node;
  if (!node) {
    throw createError({ statusCode: 500, statusMessage: "Runtime event node is unavailable." });
  }
  return node;
}

function allowCors(event: ApiEvent): void {
  const node = requireNode(event);
  node.res.setHeader("Access-Control-Allow-Origin", "*");
  node.res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  node.res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key, Authorization");
}

function requireApiKey(event: ApiEvent): void {
  const node = requireNode(event);
  const expectedKey = process.env.APP_API_KEY;
  if (!expectedKey) {
    throw createError({ statusCode: 500, statusMessage: "Server missing API key configuration." });
  }

  const headerKey = node.req.headers["x-api-key"] as string | undefined;
  const authHeader = node.req.headers["authorization"] as string | undefined;
  const token =
    headerKey?.trim() ||
    (authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined);

  if (!token || token !== expectedKey) {
    throw createError({ statusCode: 401, statusMessage: "Invalid API key." });
  }
}

export default defineEventHandler(async (event: ApiEvent) => {
  allowCors(event);
  requireApiKey(event);

  const node = requireNode(event);
  if (node.req.method === "OPTIONS") {
    return { status: "ok" };
  }

  const action = requireActionParam(event);
  const method = node.req.method;

  if (method === "GET") {
    switch (action) {
      case "health":
        return { status: "ok", conversions: store.conversions.size, uploads: store.uploads.size };
      case "conversions":
        return Array.from(store.conversions.values()).map(({ content: _content, ...rest }) => rest);
      case "logs":
        return [...store.logs].slice(-1000).reverse();
      case "profiles":
        return Array.from(store.profiles.values());
      default:
        throw createError({ statusCode: 404, statusMessage: "GET endpoint not found." });
    }
  }

  if (method === "POST") {
    const body = (await readBody(event)) as Record<string, unknown>;

    switch (action) {
      case "upload": {
        const schema = z.object({
          fileName: z.string().min(1).max(200),
          fileSize: z.number().int().positive(),
          base64: z.string().min(1),
          sheetName: z.string().min(1).optional(),
        });
        const data = schema.parse(body);
        return handleUpload(data);
      }

      case "select-sheet": {
        const schema = z.object({ uploadId: z.string().min(1), sheetName: z.string().min(1) });
        const data = schema.parse(body);
        return inspectSheet(data.uploadId, data.sheetName);
      }

      case "validate": {
        const data = conversionInput.parse(body);
        return runConversion({
          uploadId: data.uploadId,
          sheetName: data.sheetName,
          mapping: data.mapping,
          header: data.header,
          persist: false,
          treatWarningsAsErrors: data.treatWarningsAsErrors,
        });
      }

      case "generate": {
        const data = conversionInput.parse(body);
        return runConversion({
          uploadId: data.uploadId,
          sheetName: data.sheetName,
          mapping: data.mapping,
          header: data.header,
          persist: true,
          treatWarningsAsErrors: data.treatWarningsAsErrors,
        });
      }

      case "preview": {
        const schema = z.object({ id: z.string().min(1) });
        const data = schema.parse(body);
        const conversion = requireConversion(data.id);
        return { fileName: conversion.outputFileName, content: conversion.content };
      }

      case "report": {
        const schema = z.object({ id: z.string().min(1) });
        const data = schema.parse(body);
        return buildValidationReport(data.id);
      }

      case "profiles": {
        const schema = z.object({
          name: z.string().min(1).max(60),
          mapping: z.record(z.string(), z.string().optional()),
        });
        const data = schema.parse(body);
        const profile: MappingProfile = {
          id: newId("MAP"),
          name: data.name,
          mapping: data.mapping,
          createdAt: new Date().toISOString(),
        };
        store.profiles.set(profile.id, profile);
        return profile;
      }

      case "profiles-delete": {
        const schema = z.object({ id: z.string().min(1) });
        const data = schema.parse(body);
        store.profiles.delete(data.id);
        return { ok: true };
      }

      default:
        throw createError({ statusCode: 404, statusMessage: "POST endpoint not found." });
    }
  }

  throw createError({ statusCode: 405, statusMessage: "Method not allowed." });
});
