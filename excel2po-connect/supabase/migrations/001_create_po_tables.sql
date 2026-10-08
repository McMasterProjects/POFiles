CREATE SCHEMA IF NOT EXISTS po;

SET search_path TO po, public;

-- Uploads: raw uploaded workbook payloads and metadata that should be retained for traceability.
CREATE TABLE IF NOT EXISTS uploads (
  upload_id text PRIMARY KEY,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  base64 text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  source_sheet text,
  workbook_summary jsonb DEFAULT '{}'::jsonb
);

-- Conversions: one row per generated PO conversion, including output payload plus validation context.
CREATE TABLE IF NOT EXISTS conversions (
  id text PRIMARY KEY,
  upload_id text REFERENCES uploads(upload_id) ON DELETE SET NULL,
  status text NOT NULL,
  source_file_name text,
  output_file_name text,
  selected_sheet text,
  total_rows integer,
  valid_rows integer,
  invalid_rows integer,
  warning_count integer,
  record_count integer,
  pallet_count integer,
  carton_count integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  content text,
  errors jsonb DEFAULT '[]'::jsonb,
  warnings jsonb DEFAULT '[]'::jsonb,
  header jsonb DEFAULT '{}'::jsonb,
  mapping jsonb DEFAULT '{}'::jsonb,
  validation_report text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Mapping profiles: reusable Excel-to-PO mappings users save for future work.
CREATE TABLE IF NOT EXISTS mapping_profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  mapping jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Validation issues: normalized, queryable breakdown of every error/warning for each conversion.
CREATE TABLE IF NOT EXISTS validation_issues (
  id bigserial PRIMARY KEY,
  conversion_id text NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
  severity text NOT NULL,
  excel_row integer,
  record_type text,
  field text,
  code text,
  from_position integer,
  to_position integer,
  value text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Logs: structured application events and processing trace points.
CREATE TABLE IF NOT EXISTS logs (
  id bigserial PRIMARY KEY,
  timestamp timestamptz NOT NULL DEFAULT now(),
  level text NOT NULL,
  conversion_id text REFERENCES conversions(id) ON DELETE CASCADE,
  module text,
  action text,
  excel_row integer,
  field text,
  message text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- App settings: important user defaults and operational preferences across the application.
CREATE TABLE IF NOT EXISTS app_settings (
  setting_key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversions_created_at
  ON conversions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversions_upload_id
  ON conversions (upload_id);

CREATE INDEX IF NOT EXISTS idx_validation_issues_conversion_id
  ON validation_issues (conversion_id);

CREATE INDEX IF NOT EXISTS idx_logs_conversion_id
  ON logs (conversion_id);

CREATE INDEX IF NOT EXISTS idx_logs_timestamp
  ON logs (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_mapping_profiles_updated_at
  ON mapping_profiles (updated_at DESC);