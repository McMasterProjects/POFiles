import type { UploadRecord, ConversionRecord, MappingProfile } from './store.server';
import getSupabaseServiceClient from '../supabase.server';

const schema = 'po';

export async function saveUpload(record: UploadRecord) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from(`${schema}.uploads`).upsert({
    upload_id: record.uploadId,
    file_name: record.fileName,
    file_size: record.fileSize,
    base64: record.base64,
    uploaded_at: record.uploadedAt,
  });
  if (error) throw error;
  return data;
}

export async function saveConversion(record: ConversionRecord) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from(`${schema}.conversions`).upsert({
    id: record.id,
    status: record.status,
    source_file_name: record.sourceFileName,
    output_file_name: record.outputFileName,
    selected_sheet: record.selectedSheet,
    total_rows: record.totalRows,
    valid_rows: record.validRows,
    invalid_rows: record.invalidRows,
    warning_count: record.warningCount,
    record_count: record.recordCount,
    pallet_count: record.palletCount,
    carton_count: record.cartonCount,
    created_at: record.createdAt,
    completed_at: record.completedAt,
    content: record.content,
    errors: record.errors,
    warnings: record.warnings,
    header: record.header,
    mapping: record.mapping,
  });
  if (error) throw error;
  return data;
}

export async function saveMappingProfile(profile: MappingProfile) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from(`${schema}.mapping_profiles`).upsert({
    id: profile.id,
    name: profile.name,
    mapping: profile.mapping,
    created_at: profile.createdAt,
  });
  if (error) throw error;
  return data;
}

export async function pushLogs(entries: any[]) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return null;
  const rows = entries.map((e) => ({
    timestamp: e.timestamp,
    level: e.level,
    conversion_id: e.conversionId,
    module: e.module,
    action: e.action,
    excel_row: e.excelRow ?? null,
    field: e.field ?? null,
    message: e.message ?? null,
  }));
  const { data, error } = await supabase.from(`${schema}.logs`).insert(rows);
  if (error) throw error;
  return data;
}
