import type {
  AppSettingsState,
  ColumnMapping,
  LogEntry,
  POHeaderInput,
  ValidationIssue,
} from "./types";
import * as supaStore from "./supabase-store.server";

export interface UploadRecord {
  uploadId: string;
  fileName: string;
  fileSize: number;
  base64: string;
  uploadedAt: string;
}

export interface ConversionRecord {
  id: string;
  uploadId: string;
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
  updatedAt?: string;
}

interface POStore {
  uploads: Map<string, UploadRecord>;
  conversions: Map<string, ConversionRecord>;
  logs: LogEntry[];
  profiles: Map<string, MappingProfile>;
  settings: Map<string, AppSettingsState>;
}

const g = globalThis as unknown as { __poStore?: POStore };

const created: POStore = g.__poStore ?? {
  uploads: new Map<string, UploadRecord>(),
  conversions: new Map<string, ConversionRecord>(),
  logs: [] as LogEntry[],
  profiles: new Map<string, MappingProfile>(),
  settings: new Map<string, AppSettingsState>(),
};
g.__poStore = created;

export const store: POStore = created;

export function hydrateConversionRecords(records: Array<Partial<ConversionRecord>>) {
  for (const record of records) {
    if (!record?.id) continue;
    store.conversions.set(record.id, {
      id: record.id,
      uploadId: record.uploadId ?? "",
      status: record.status ?? "Unknown",
      sourceFileName: record.sourceFileName ?? "",
      outputFileName: record.outputFileName ?? "",
      selectedSheet: record.selectedSheet ?? "",
      totalRows: record.totalRows ?? 0,
      validRows: record.validRows ?? 0,
      invalidRows: record.invalidRows ?? 0,
      warningCount: record.warningCount ?? 0,
      recordCount: record.recordCount ?? 0,
      palletCount: record.palletCount ?? 0,
      cartonCount: record.cartonCount ?? 0,
      createdAt: record.createdAt ?? new Date().toISOString(),
      completedAt: record.completedAt ?? null,
      content: record.content ?? "",
      errors: record.errors ?? [],
      warnings: record.warnings ?? [],
      header: record.header ?? ({} as POHeaderInput),
      mapping: record.mapping ?? {},
    });
  }
}

export function pushLogs(entries: LogEntry[]) {
  void (async () => {
    try {
      const res = await supaStore.pushLogs(entries as any[]);
      if (!res) {
        store.logs.push(...entries);
        if (store.logs.length > 5000) store.logs.splice(0, store.logs.length - 5000);
      }
    } catch (e) {
      store.logs.push(...entries);
      if (store.logs.length > 5000) store.logs.splice(0, store.logs.length - 5000);
    }
  })();
}

export async function saveUploadRecord(record: UploadRecord) {
  try {
    const res = await supaStore.saveUpload(record);
    if (res) return res;
  } catch (e) {
    // ignore and fallback
  }
  store.uploads.set(record.uploadId, record);
  return record;
}

export async function saveConversionRecord(record: ConversionRecord) {
  try {
    const res = await supaStore.saveConversion(record);
    if (res) return res;
  } catch (e) {
    // ignore and fallback
  }
  store.conversions.set(record.id, record);
  return record;
}

export async function saveMappingProfileRecord(profile: MappingProfile) {
  try {
    const res = await supaStore.saveMappingProfile(profile);
    if (res) return res;
  } catch (e) {
    // ignore and fallback
  }
  store.profiles.set(profile.id, profile);
  return profile;
}

export async function saveSettingsState(key: string, value: AppSettingsState) {
  const record = { key, value, updatedAt: new Date().toISOString() };
  try {
    const res = await supaStore.saveAppSettings(record);
    if (res) {
      store.settings.set(key, value);
      return value;
    }
  } catch (e) {
    // ignore and fallback
  }
  store.settings.set(key, value);
  return value;
}

export async function loadSettingsState(key: string) {
  if (store.settings.has(key)) return store.settings.get(key) ?? null;

  try {
    const res = await supaStore.loadAppSettings(key);
    if (res) {
      store.settings.set(key, res as AppSettingsState);
      return res as AppSettingsState;
    }
  } catch (e) {
    // ignore and fallback
  }

  return null;
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
