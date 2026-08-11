-- Migration: create PO-related tables and indexes
-- Location: supabase/migrations/001_create_po_tables.sql

CREATE SCHEMA IF NOT EXISTS po;

SET search_path TO po, public;

-- Uploads (raw uploaded files - storing base64 for now)
CREATE TABLE IF NOT EXISTS uploads (
  upload_id text PRIMARY KEY,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  base64 text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- Conversions (results of generation)
CREATE TABLE IF NOT EXISTS conversions (
  id text PRIMARY KEY,
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
  errors jsonb,
  warnings jsonb,
  header jsonb,
  mapping jsonb
);

-- Mapping profiles (reusable column mappings)
CREATE TABLE IF NOT EXISTS mapping_profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  mapping jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Logs (conversion events)
CREATE TABLE IF NOT EXISTS logs (
  id bigserial PRIMARY KEY,
  timestamp timestamptz NOT NULL DEFAULT now(),
  level text NOT NULL,
  conversion_id text REFERENCES conversions(id) ON DELETE CASCADE,
  module text,
  action text,
  excel_row integer,
  field text,
  message text
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_conversion_id ON logs (conversion_id);
