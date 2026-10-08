import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eraser,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import {
  ActivityTileGroup,
  AppShell,
  Breadcrumb,
  CommandBar,
  CommandButton,
  DataTable,
  PageHeader,
  Section,
  StatusIndicator,
  type StatusKind,
} from "@/components/bc/shell";
import {
  parseAndValidatePO,
  type POValidationResult,
} from "@/lib/po/po-validation";
import type { ParsedPOFile } from "@/lib/po/po-parser";
import { convertedWorkbook } from "@/lib/po/po-to-excel";

export const Route = createFileRoute("/po-to-excel")({
  head: () => ({
    meta: [
      {
        title: "Open in Excel | Excel to PO Converter",
      },
      {
        name: "description",
        content:
          "Parse a fixed-width PO transmission into an Excel workbook.",
      },
    ],
  }),
  component: POToExcelPage,
});

const previewFields = [
  ["palletId", "Pallet ID"],
  ["sscc", "SSCC / Barcode"],
  ["cartons", "Cartons"],
  ["commodity", "Commodity"],
  ["variety", "Variety"],
  ["grade", "Grade"],
  ["pack", "Pack"],
  ["batchNumber", "Batch Number"],
] as const;

function readPOFile(file: File): Promise<string> {
  return file
    .arrayBuffer()
    .then((buffer) =>
      new TextDecoder("windows-1252").decode(buffer),
    );
}

/**
 * Builds the downloaded workbook filename from the original
 * uploaded PO filename.
 *
 * Example:
 * PO043275SA.000 -> PO043275SA_converted.xlsx
 */
function createExcelFileName(originalFileName: string): string {
  const cleanFileName = originalFileName
    .trim()
    .replace(/^.*[\\/]/, "");

  const fileNameWithoutExtension =
    cleanFileName.replace(/\.[^.]+$/, "") || "po-file";

  return `${fileNameWithoutExtension}_converted.xlsx`;
}

function POToExcelPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] =
    useState<ParsedPOFile | null>(null);
  const [validation, setValidation] =
    useState<POValidationResult | null>(null);
  const [dragging, setDragging] = useState(false);

  const statusKind: StatusKind = !validation
    ? "idle"
    : validation.status === "Invalid"
      ? "error"
      : validation.status === "Warning"
        ? "warning"
        : "valid";

  async function handleFile(file?: File) {
    if (!file) return;

    try {
      const poText = await readPOFile(file);
      const result = parseAndValidatePO(poText);

      // Keep the original uploaded PO filename.
      setFileName(file.name);

      setParsed(result.parsed);
      setValidation(result.validation);

      toast.success(`${file.name} loaded`);
    } catch (error) {
      toast.error(
        `Could not read PO file: ${(error as Error).message}`,
      );
    }
  }

  function clearFile() {
    setFileName("");
    setParsed(null);
    setValidation(null);
    setDragging(false);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function validateFile() {
    if (!parsed) {
      toast.error("Upload a PO file first.");
      return;
    }

    const poText =
      parsed.records
        .map((record) => record.raw)
        .join("\r\n") +
      (parsed.records.length ? "\r\n" : "");

    const result = parseAndValidatePO(poText);

    setParsed(result.parsed);
    setValidation(result.validation);

    if (result.validation.errors.length) {
      toast.error("Validation found errors");
    } else {
      toast.success("PO validation complete");
    }
  }

  function downloadExcel() {
    if (!parsed || !validation) {
      toast.error(
        "Upload and validate a PO file first.",
      );
      return;
    }

    if (!fileName.trim()) {
      toast.error(
        "The original uploaded PO filename is missing.",
      );
      return;
    }

    /*
     * Pass the original uploaded PO filename into the workbook.
     * This is also used for the EDI File Name column.
     */
    const workbook = convertedWorkbook(
      parsed,
      validation,
      fileName,
    );

    /*
     * Build the final download name directly from the uploaded
     * PO filename. No container number is used here.
     */
    const downloadFileName =
      createExcelFileName(fileName);

    XLSX.writeFile(workbook, downloadFileName);

    toast.success(`${downloadFileName} downloaded`);
  }

  const issues = validation
    ? [
        ...validation.errors,
        ...validation.warnings,
      ]
    : [];

  return (
    <AppShell>
      <div className="space-y-4">
        <Breadcrumb
          items={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: "Open in Excel",
            },
          ]}
        />

        <PageHeader
          title="Open in Excel"
          subtitle="Convert PO files into structured, ready-to-use Excel spreadsheets."
          actions={[
            {
              label: "Clear File",
              onClick: clearFile,
              icon: Eraser,
            },
            {
              label: "Validate PO",
              onClick: validateFile,
              icon: CheckCircle2,
            },
            {
              label: "Download Excel",
              onClick: downloadExcel,
              icon: Download,
              primary: true,
            },
          ]}
        />

        <CommandBar>
          <CommandButton
            icon={Upload}
            onClick={() => fileRef.current?.click()}
            primary
          >
            Upload PO File
          </CommandButton>

          <CommandButton
            icon={Eraser}
            onClick={clearFile}
            disabled={!parsed}
          >
            Clear File
          </CommandButton>

          <CommandButton
            icon={CheckCircle2}
            onClick={validateFile}
            disabled={!parsed}
          >
            Validate PO
          </CommandButton>

          <CommandButton
            icon={Download}
            onClick={downloadExcel}
            disabled={!parsed || !validation}
          >
            Download Excel
          </CommandButton>
        </CommandBar>

        <Section
          title="File Information"
          collapsible={false}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".000,.txt,text/plain,*/*"
            className="hidden"
            onChange={(event) =>
              void handleFile(
                event.target.files?.[0],
              )
            }
          />

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => {
              setDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);

              void handleFile(
                event.dataTransfer.files[0],
              );
            }}
            onClick={() =>
              fileRef.current?.click()
            }
            className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary"
            }`}
          >
            <FileSpreadsheet className="mb-2 h-8 w-8 text-primary" />

            <p className="text-sm font-semibold">
              {fileName ||
                "Drop a .000, .txt, or extensionless PO file here"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Browse to select a fixed-width
              plain-text transmission
            </p>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs">
            <StatusIndicator
              kind={statusKind}
              label={
                validation?.status ??
                "Awaiting file"
              }
            />

            {parsed && (
              <span className="text-muted-foreground">
                {parsed.lineEnding} line endings
              </span>
            )}
          </div>
        </Section>

        <ActivityTileGroup
          title="PO Summary"
          tiles={[
            {
              label: "Uploaded File",
              value: fileName || "-",
              color: "blue",
            },
            {
              label: "Total Records",
              value:
                parsed?.records.length ?? 0,
              color: "gray",
            },
            {
              label: "OP Pallet Records",
              value:
                parsed?.pallets.length ?? 0,
              color: "green",
            },
            {
              label: "Validation Issues",
              value: issues.length,
              color: issues.some(
                (issue) =>
                  issue.severity === "error",
              )
                ? "red"
                : "orange",
            },
          ]}
        />

        <Section
          title="Validation Messages"
          collapsible={false}
        >
          {issues.length ? (
            <DataTable
              columns={[
                {
                  key: "severity",
                  header: "Severity",
                },
                {
                  key: "code",
                  header: "Code",
                },
                {
                  key: "line",
                  header: "Line",
                },
                {
                  key: "record",
                  header: "Record",
                },
                {
                  key: "field",
                  header: "Field",
                },
                {
                  key: "message",
                  header: "Message",
                },
              ]}
              data={issues.map((issue) => ({
                severity: issue.severity,
                code: issue.code,
                line:
                  issue.lineNumber ?? "-",
                record:
                  issue.recordType ?? "-",
                field: issue.field ?? "-",
                message: issue.message,
              }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No validation messages.
            </p>
          )}
        </Section>

        <Section
          title="Pallet Details Preview"
          collapsible={false}
        >
          <DataTable
            columns={[
              {
                key: "line",
                header: "Source Line",
              },
              ...previewFields.map(
                ([key, label]) => ({
                  key,
                  header: label,
                }),
              ),
            ]}
            data={(parsed?.pallets ?? []).map(
              (pallet) => ({
                line: pallet.lineNumber,
                ...Object.fromEntries(
                  previewFields.map(([key]) => [
                    key,
                    pallet[key],
                  ]),
                ),
              }),
            )}
            empty="Upload a PO file to preview OP pallet records."
          />
        </Section>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {validation?.status === "Valid" ? (
            <CheckCircle2 className="h-4 w-4 text-status-valid" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          )}

          Workbook sheet: Stock Pallet
        </div>
      </div>
    </AppShell>
  );
}