/** In-memory server-side storage for uploads, conversions, logs and profiles.
 * File content is kept in backend storage, never returned to the client
 * except through the explicit preview/download endpoints. */
import type { ColumnMapping, LogEntry, POHeaderInput, ValidationIssue } from "./types";

export interface UploadRecord {
  uploadId: string;
  fileName: string;
  fileSize: number;
  base64: string;
  uploadedAt: string;
}

export interface ConversionRecord {
  id: string;
  status: string;
  sourceFileName: string;
  outputFileName: string;
  selectedSheet: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warningCount: number;
  recordCount: number;
  palletCount: number;
  cartonCount: number;
  createdAt: string;
  completedAt: string | null;
  content: string;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  header: POHeaderInput;
  mapping: ColumnMapping;
}

export interface MappingProfile {
  id: string;
  name: string;
  mapping: ColumnMapping;
  createdAt: string;
}

interface POStore {
  uploads: Map<string, UploadRecord>;
  conversions: Map<string, ConversionRecord>;
  logs: LogEntry[];
  profiles: Map<string, MappingProfile>;
}

const g = globalThis as unknown as { __poStore?: POStore };

const created: POStore = g.__poStore ?? {
  uploads: new Map<string, UploadRecord>(),
  conversions: new Map<string, ConversionRecord>(),
  logs: [] as LogEntry[],
  profiles: new Map<string, MappingProfile>(),
};
g.__poStore = created;

export const store: POStore = created;

export function pushLogs(entries: LogEntry[]) {
  store.logs.push(...entries);
  if (store.logs.length > 5000) store.logs.splice(0, store.logs.length - 5000);
}

export function logEvent(
  conversionId: string,
  module: string,
  action: string,
  extra: Partial<LogEntry> = {},
) {
  pushLogs([
    {
      timestamp: new Date().toISOString(),
      level: "info",
      conversionId,
      module,
      action,
      ...extra,
    },
  ]);
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}
