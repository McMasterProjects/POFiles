import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Upload,
  CheckCircle2,
  File,
  Download,
  FileText,
  Eraser,
  RefreshCw,
  Beaker,
} from "lucide-react";
import {
  AppShell,
  CommandBar,
  CommandButton,
  FastTab,
  Field,
  PageTitle,
  StatusIndicator,
  type StatusKind,
} from "@/components/bc/shell";
import {
  generateConversionFn,
  selectSheetFn,
  uploadExcelFn,
  validateConversionFn,
  saveMappingProfileFn,
} from "@/lib/po/conversion.functions";
import {
  PALLET_FIELDS,
  type ColumnMapping,
  type POHeaderInput,
  type ValidationIssue,
} from "@/lib/po/types";
import { getMappingOptionLabel } from "@/lib/po/mapping";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Excel to PO Conversion | Paltrack Transmission Utility" },
      {
        name: "description",
        content:
          "Convert pallet spreadsheets into Paltrack fixed-width PO transmission files with backend validation, record-length checks and .000 download.",
      },
      { property: "og:title", content: "Excel to PO Conversion | Paltrack Transmission Utility" },
      {
        property: "og:description",
        content:
          "Convert pallet spreadsheets into Paltrack fixed-width PO transmission files with backend validation, record-length checks and .000 download.",
      },
    ],
  }),
  component: ConvertExcelPage,
});

type Inspection = {
  uploadId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  worksheets: { name: string; rowCount: number; columnCount: number }[];
  sheetName: string;
  headers: string[];
  rowCount: number;
  previewRows: Record<string, string>[];
  suggestedMapping: ColumnMapping;
  suggestedHeaderValues: Partial<POHeaderInput>;
};

type RunResult = Awaited<ReturnType<typeof validateConversionFn>>;

const emptyHeader: POHeaderInput = {
  sourceAddress: "MTS",
  destinationAddress: "000",
  sequenceNumber: "0001",
  batchNumber: "465",
  loadId: "",
  loadReference: "",
  locationCode: "",
  containerNumber: "",
  sealNumber: "",
  consignmentNumber: "OPMT000465",
  organisationCode: "",
  countryCode: "ZA",
  channel: "E",
  destinationType: "PO",
  destinationLocation: "",
  stuffingDate: "",
  transactionDate: "",
  transactionTime: "",
  provider: "MATES",
  version: "2.18",
  fileName: "",
};

function downloadText(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=windows-1252" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function normalizeDateValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 8) return digits;
  if (digits.length === 6) return digits;
  if (digits.length === 7) return digits.slice(0, 4) + digits.slice(4);

  return trimmed.slice(0, 8);
}

function normalizeHeaderForValidation(header: POHeaderInput): POHeaderInput {
  return {
    ...header,
    stuffingDate: normalizeDateValue(header.stuffingDate ?? ""),
    transactionDate: normalizeDateValue(header.transactionDate ?? ""),
    transactionTime: (header.transactionTime ?? "").trim().slice(0, 5),
  };
}

function ConvertExcelPage() {
  const upload = useServerFn(uploadExcelFn);
  const selectSheet = useServerFn(selectSheetFn);
  const validate = useServerFn(validateConversionFn);
  const generate = useServerFn(generateConversionFn);
  const saveProfile = useServerFn(saveMappingProfileFn);

  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [header, setHeader] = useState<POHeaderInput>(emptyHeader);
  const [result, setResult] = useState<RunResult | null>(null);
  const [preview, setPreview] = useState<{ fileName: string; content: string } | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<ValidationIssue | null>(null);
  const [logLines, setLogLines] = useState<string[]>([]);

  const status: StatusKind = !inspection
    ? "idle"
    : busy
      ? "processing"
      : result
        ? result.errors.length
          ? "error"
          : result.warnings.length
            ? "warning"
            : "valid"
        : "idle";

  const statusLabel = !inspection
    ? "Not processed"
    : busy
      ? "Processing"
      : result
        ? result.errors.length
          ? `${result.errors.length} error(s)`
          : result.warnings.length
            ? `${result.warnings.length} warning(s)`
            : "Valid"
        : "Awaiting validation";

  const generatedName = useMemo(() => {
    if (header.fileName?.trim()) return header.fileName.trim();
    const seq = String(header.sequenceNumber || header.batchNumber || "")
      .trim()
      .padStart(3, "0");
    const destination = String(header.destinationAddress || "000")
      .trim()
      .slice(0, 3)
      .padEnd(3, "0");
    return `POMTS${seq}.${destination}`;
  }, [header]);

  const addLog = (message: string) =>
    setLogLines((lines) => [`${new Date().toISOString()}  ${message}`, ...lines].slice(0, 300));

  function mergeSuggestedHeaderValues(
    currentHeader: POHeaderInput,
    suggested?: Partial<POHeaderInput>,
  ): POHeaderInput {
    if (!suggested) return currentHeader;

    const suggestedValues = Object.fromEntries(
      Object.entries(suggested).filter(([key, value]) => {
        const currentValue = currentHeader[key as keyof POHeaderInput];

        return (
          typeof value === "string" &&
          value.trim().length > 0 &&
          (typeof currentValue !== "string" || currentValue.trim().length === 0)
        );
      }),
    ) as Partial<POHeaderInput>;

    return {
      ...currentHeader,
      ...suggestedValues,
    };
  }

  const payload = () => {
    if (!inspection) throw new Error("Upload an Excel file first.");
    const normalizedHeader = header.fileName?.trim()
      ? { ...header, fileName: header.fileName.trim() }
      : { ...header, fileName: undefined };
    return {
      uploadId: inspection.uploadId,
      sheetName: inspection.sheetName,
      mapping: mapping as Record<string, string | undefined>,
      header: normalizeHeaderForValidation(normalizedHeader),
    };
  };

  async function handleFile(file: File) {
    setBusy("Uploading");
    try {
      const base64 = toBase64(await file.arrayBuffer());
      const data = (await upload({
        data: { fileName: file.name, fileSize: file.size, base64 },
      })) as Inspection;
      setInspection(data);
      setMapping(data.suggestedMapping);
      setHeader((prev) => mergeSuggestedHeaderValues(prev, data.suggestedHeaderValues));
      setResult(null);
      setPreview(null);
      addLog(
        `File received: ${data.fileName} (${data.rowCount} rows, ${data.headers.length} columns)`,
      );
      toast.success(`${data.fileName} uploaded`);
    } catch (error) {
      toast.error((error as Error).message);
      addLog(`ERROR ${(error as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function changeSheet(sheetName: string) {
    if (!inspection) return;
    setBusy("Reading worksheet");
    try {
      const data = await selectSheet({ data: { uploadId: inspection.uploadId, sheetName } });
      setInspection({
        ...inspection,
        ...(data as Omit<Inspection, "uploadId" | "fileName" | "fileSize" | "uploadedAt">),
      });
      setMapping(data.suggestedMapping as ColumnMapping);
      setHeader((prev) =>
        mergeSuggestedHeaderValues(prev, (data as Inspection).suggestedHeaderValues),
      );
      addLog(`Worksheet selected: ${sheetName}`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function runValidate() {
    setBusy("Validating");
    try {
      const data = (await validate({ data: payload() })) as RunResult;
      setResult(data);
      data.logs.forEach((l) =>
        addLog(`${l.module}: ${l.action}${l.message ? ` — ${l.message}` : ""}`),
      );
      if (data.errors.length) toast.error(`${data.errors.length} validation error(s)`);
      else toast.success("Validation passed");
    } catch (error) {
      toast.error((error as Error).message);
      addLog(`ERROR ${(error as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function runGenerate() {
    setBusy("Generating");
    try {
      const data = (await generate({ data: payload() })) as RunResult;
      setResult(data);
      addLog(`Generation ${data.status}: ${data.recordCount} records, ${data.palletCount} pallets`);
      if (data.errors.length) {
        toast.error("Generation blocked by validation errors");
        setPreview(null);
        return;
      }
      const { getConversionPreviewFn } = await import("@/lib/po/conversion.functions");
      const file = await getConversionPreviewFn({ data: { id: data.conversionId } });
      setPreview(file);
      toast.success(`${file.fileName} generated`);
    } catch (error) {
      toast.error((error as Error).message);
      addLog(`ERROR ${(error as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function downloadReport() {
    if (!result) return;
    const { getConversionReportFn } = await import("@/lib/po/conversion.functions");
    try {
      const report = await getConversionReportFn({ data: { id: result.conversionId } });
      downloadText(report.fileName, report.content);
    } catch {
      toast.error("Generate the PO file first to produce a report.");
    }
  }

  function clearAll() {
    setInspection(null);
    setMapping({});
    setResult(null);
    setPreview(null);
    setSelectedIssue(null);
    setLogLines([]);
  }

  const issues = [...(result?.errors ?? []), ...(result?.warnings ?? [])];

  return (
    <AppShell>
      <PageTitle
        title="Excel to PO Conversion"
        subtitle="Upload a pallet spreadsheet and transmit a Paltrack fixed-width PO file."
      />

      <CommandBar>
        <CommandButton icon={Upload} onClick={() => fileRef.current?.click()} primary>
          Upload Excel
        </CommandButton>
        <CommandButton
          icon={File}
          onClick={() => {
            setHeader({
              ...emptyHeader,
              locationCode: "CPT0001",
              containerNumber: "MSDU9721477",
              sealNumber: "ZA123456",
              consignmentNumber: "CONS000123",
              organisationCode: "GG",
              destinationLocation: "CPT0001",
            });
            addLog("Sample PO header loaded");
          }}
        >
          Load Sample PO
        </CommandButton>
        <CommandButton icon={CheckCircle2} onClick={runValidate} disabled={!inspection || !!busy}>
          Validate
        </CommandButton>
        <CommandButton icon={File} onClick={runGenerate} disabled={!inspection || !!busy}>
          Generate PO
        </CommandButton>
        <CommandButton
          icon={Download}
          disabled={!preview}
          onClick={() => preview && downloadText(preview.fileName, preview.content)}
        >
          Download PO
        </CommandButton>
        <CommandButton icon={FileText} disabled={!result} onClick={downloadReport}>
          Download Validation Report
        </CommandButton>
        <CommandButton icon={Eraser} onClick={clearAll}>
          Clear
        </CommandButton>
        <CommandButton
          icon={RefreshCw}
          onClick={() => inspection && changeSheet(inspection.sheetName)}
        >
          Refresh
        </CommandButton>
        <span className="ml-auto pr-1">
          <StatusIndicator kind={status} label={busy ?? statusLabel} />
        </span>
      </CommandBar>

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <FastTab title="General" summary={inspection ? inspection.fileName : "No file"}>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) void handleFile(file);
              }}
              className="flex items-center justify-between border border-dashed border-input bg-secondary px-3 py-4 text-[12.5px]"
            >
              <span className="text-muted-foreground">
                Drag an .xlsx file here, or use Upload Excel on the command bar.
              </span>
              <StatusIndicator kind={status} label={statusLabel} />
            </div>
          </FastTab>

          <FastTab
            title="File Information"
            summary={inspection ? `${inspection.rowCount} rows` : "—"}
          >
            {inspection ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12.5px] md:grid-cols-3">
                <Info label="File name" value={inspection.fileName} />
                <Info label="File size" value={`${(inspection.fileSize / 1024).toFixed(1)} KB`} />
                <Info label="Uploaded" value={new Date(inspection.uploadedAt).toLocaleString()} />
                <Info label="Rows" value={String(inspection.rowCount)} />
                <Info label="Columns" value={String(inspection.headers.length)} />
                <label className="block">
                  <span className="bc-label">Worksheet</span>
                  <select
                    className="bc-input"
                    value={inspection.sheetName}
                    onChange={(e) => void changeSheet(e.target.value)}
                  >
                    {inspection.worksheets.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.rowCount} rows)
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <Empty />
            )}
          </FastTab>

          <FastTab title="PO Header" summary={generatedName}>
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
              {(
                [
                  ["Source Address", "sourceAddress", 3],
                  ["Destination Address", "destinationAddress", 3],
                  ["Sequence Number", "sequenceNumber", 10],
                  ["Batch Number", "batchNumber", 10],
                  ["Load ID", "loadId", 10],
                  ["Load Reference", "loadReference", 10],
                  ["Location Code", "locationCode", 7],
                  ["Container Number", "containerNumber", 11],
                  ["Seal Number", "sealNumber", 15],
                  ["Consignment Number", "consignmentNumber", 10],
                  ["Organisation Code", "organisationCode", 2],
                  ["Country Code", "countryCode", 2],
                  ["Channel", "channel", 1],
                  ["Destination Type", "destinationType", 2],
                  ["Destination Location", "destinationLocation", 7],
                  ["Stuffing Date (yyyymmdd)", "stuffingDate", 8],
                  ["Transaction Date (yyyymmdd)", "transactionDate", 8],
                  ["Transaction Time (hh:mm)", "transactionTime", 5],
                  ["Provider", "provider", 30],
                  ["Version", "version", 30],
                ] as [string, keyof POHeaderInput, number][]
              ).map(([label, key, max]) => (
                <Field
                  key={key}
                  label={label}
                  maxLength={max}
                  value={(header[key] as string) ?? ""}
                  onChange={(value) => setHeader((h) => ({ ...h, [key]: value }))}
                />
              ))}
              <Field
                label="File Name (auto)"
                value={header.fileName ?? ""}
                placeholder={generatedName}
                onChange={(value) => setHeader((h) => ({ ...h, fileName: value }))}
              />
            </div>
          </FastTab>

          <FastTab title="Column Mapping" summary={`${Object.keys(mapping).length} mapped`}>
            {inspection ? (
              <>
                <div className="mb-2 flex gap-2">
                  <button
                    className="rounded-[2px] border border-input px-2 py-1 text-[12px] hover:bg-accent"
                    onClick={async () => {
                      const name = window.prompt("Mapping profile name", "Paltrack PO");
                      if (!name) return;
                      await saveProfile({
                        data: { name, mapping: mapping as Record<string, string> },
                      });
                      toast.success("Mapping profile saved");
                    }}
                  >
                    Save mapping profile
                  </button>
                </div>
                <div className="max-h-80 overflow-auto border border-border">
                  <table className="w-full border-collapse text-[12px]">
                    <thead className="sticky top-0 bg-secondary text-left">
                      <tr>
                        <Th>PO Field</Th>
                        <Th>Record</Th>
                        <Th>Positions</Th>
                        <Th>Type</Th>
                        <Th>Required</Th>
                        <Th>Excel Header</Th>
                        <Th>Sample Value</Th>
                        <Th>Status</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {PALLET_FIELDS.map((field) => {
                        const selected = mapping[field.key] ?? "";
                        const sample = selected
                          ? (inspection.previewRows[0]?.[selected] ?? "")
                          : "";
                        return (
                          <tr
                            key={field.key}
                            className="border-t border-border hover:bg-secondary/60"
                          >
                            <Td>{field.label}</Td>
                            <Td>{field.recordType}</Td>
                            <Td>
                              {field.from}–{field.to}
                            </Td>
                            <Td>{field.type}</Td>
                            <Td>{field.required ? "Yes" : "No"}</Td>
                            <Td>
                              <select
                                className="bc-input"
                                value={selected}
                                onChange={(e) =>
                                  setMapping((m) => ({
                                    ...m,
                                    [field.key]: e.target.value || undefined,
                                  }))
                                }
                              >
                                <option value="">(not mapped)</option>
                                {inspection.headers.map((h) => (
                                  <option key={h} value={h}>
                                    {getMappingOptionLabel(h, field.key)}
                                  </option>
                                ))}
                              </select>
                            </Td>
                            <Td className="max-w-[160px] truncate">{sample}</Td>
                            <Td>
                              <StatusIndicator
                                kind={selected ? "valid" : field.required ? "error" : "idle"}
                                label={
                                  selected ? "Mapped" : field.required ? "Required" : "Optional"
                                }
                              />
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <Empty />
            )}
          </FastTab>

          <FastTab
            title="Excel Preview"
            summary={inspection ? `${inspection.previewRows.length} rows` : "—"}
            defaultOpen={false}
          >
            {inspection ? (
              <div className="max-h-72 overflow-auto border border-border">
                <table className="border-collapse text-[12px]">
                  <thead className="sticky top-0 bg-secondary">
                    <tr>
                      <Th>#</Th>
                      {inspection.headers.map((h) => (
                        <Th key={h}>{h}</Th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inspection.previewRows.map((row, i) => (
                      <tr key={i} className="border-t border-border">
                        <Td>{i + 2}</Td>
                        {inspection.headers.map((h) => (
                          <Td key={h} className="whitespace-nowrap">
                            {row[h]}
                          </Td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty />
            )}
          </FastTab>

          <FastTab
            title="Validation"
            summary={`${result?.errors.length ?? 0} errors / ${result?.warnings.length ?? 0} warnings`}
          >
            {issues.length ? (
              <div className="max-h-72 overflow-auto border border-border">
                <table className="w-full border-collapse text-[12px]">
                  <thead className="sticky top-0 bg-secondary text-left">
                    <tr>
                      <Th>Severity</Th>
                      <Th>Excel Row</Th>
                      <Th>Record</Th>
                      <Th>Field</Th>
                      <Th>Code</Th>
                      <Th>Message</Th>
                      <Th>Value</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue, i) => (
                      <tr
                        key={i}
                        onClick={() => setSelectedIssue(issue)}
                        className="cursor-pointer border-t border-border hover:bg-secondary"
                      >
                        <Td>
                          <StatusIndicator
                            kind={issue.severity === "error" ? "error" : "warning"}
                            label={issue.severity}
                          />
                        </Td>
                        <Td>{issue.excelRow ?? "—"}</Td>
                        <Td>{issue.recordType ?? "—"}</Td>
                        <Td>{issue.field ?? "—"}</Td>
                        <Td>{issue.code}</Td>
                        <Td>{issue.message}</Td>
                        <Td className="max-w-[160px] truncate">{issue.value ?? ""}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[12.5px] text-muted-foreground">
                {result ? "No validation issues." : "Run Validate to check the mapped data."}
              </p>
            )}
          </FastTab>

          <FastTab title="Generated PO Preview" summary={preview?.fileName ?? "—"}>
            {preview ? (
              <div className="max-h-96 overflow-auto border border-border bg-card">
                <pre className="font-mono text-[11.5px] leading-[1.35]">
                  {preview.content
                    .split("\r\n")
                    .filter(Boolean)
                    .map((line, i) => (
                      <div key={i} className="flex whitespace-pre">
                        <span className="sticky left-0 w-12 shrink-0 select-none border-r border-border bg-secondary px-1 text-right text-muted-foreground">
                          {i + 1}
                        </span>
                        <span className="px-2">{line}</span>
                      </div>
                    ))}
                </pre>
              </div>
            ) : (
              <p className="text-[12.5px] text-muted-foreground">
                Generate the PO file to preview it.
              </p>
            )}
          </FastTab>

          <FastTab
            title="Processing Log"
            summary={`${logLines.length} entries`}
            defaultOpen={false}
          >
            <pre className="max-h-64 overflow-auto bg-secondary p-2 font-mono text-[11.5px]">
              {logLines.join("\n") || "No activity yet."}
            </pre>
          </FastTab>
        </div>

        <aside className="space-y-2">
          <div className="bc-card p-3">
            <h2 className="mb-2 text-[12.5px] font-semibold text-heading">Conversion FactBox</h2>
            <dl className="space-y-1 text-[12px]">
              <Row label="Conversion ID" value={result?.conversionId ?? "—"} />
              <Row label="Status" value={result?.status ?? "Not processed"} />
              <Row label="Output file" value={result?.fileName ?? generatedName} />
              <Row label="Records" value={String(result?.recordCount ?? 0)} />
              <Row label="Pallets" value={String(result?.palletCount ?? 0)} />
              <Row label="Cartons" value={String(result?.cartonCount ?? 0)} />
              <Row label="Valid rows" value={String(result?.validRows ?? 0)} />
              <Row label="Invalid rows" value={String(result?.invalidRows ?? 0)} />
            </dl>
          </div>

          <div className="bc-card p-3">
            <h2 className="mb-2 text-[12.5px] font-semibold text-heading">Record Lengths</h2>
            <div className="space-y-1 text-[12px]">
              {(result?.recordLengths ?? []).slice(0, 8).map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{r.recordType}</span>
                  <StatusIndicator
                    kind={r.ok ? "valid" : "error"}
                    label={`${r.length}/${r.expected}`}
                  />
                </div>
              ))}
              {!result ? <p className="text-muted-foreground">Not calculated.</p> : null}
            </div>
          </div>

          {selectedIssue ? (
            <div className="bc-card p-3">
              <h2 className="mb-2 text-[12.5px] font-semibold text-heading">Error Details</h2>
              <dl className="space-y-1 text-[12px]">
                <Row label="Code" value={selectedIssue.code} />
                <Row label="Severity" value={selectedIssue.severity} />
                <Row label="Record" value={selectedIssue.recordType ?? "—"} />
                <Row label="Excel row" value={String(selectedIssue.excelRow ?? "—")} />
                <Row label="Field" value={selectedIssue.field ?? "—"} />
                <Row
                  label="Positions"
                  value={
                    selectedIssue.fromPosition
                      ? `${selectedIssue.fromPosition}–${selectedIssue.toPosition}`
                      : "—"
                  }
                />
                <Row label="Expected" value={String(selectedIssue.expectedLength ?? "—")} />
                <Row label="Actual" value={String(selectedIssue.actualLength ?? "—")} />
                <Row label="Value" value={selectedIssue.value ?? "—"} />
              </dl>
              <p className="mt-2 text-[12px] text-muted-foreground">{selectedIssue.message}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="bc-label">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-border/60 pb-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right">{value}</dd>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-r border-border px-2 py-1 font-semibold whitespace-nowrap">{children}</th>
  );
}

function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`border-r border-border px-2 py-1 align-top ${className}`}>{children}</td>;
}

function Empty() {
  return <p className="text-[12.5px] text-muted-foreground">Upload an Excel file to continue.</p>;
}
