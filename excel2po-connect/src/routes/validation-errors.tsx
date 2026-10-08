import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AppShell,
  PageHeader,
  Section,
  DataTable,
  Breadcrumb,
} from "@/components/bc/shell";
import { listConversionsFn } from "@/lib/po/conversion.functions";

export const Route = createFileRoute("/validation-errors")({
  head: () => ({
    meta: [
      { title: "Validation Errors | Excel to PO Converter" },
      {
        name: "description",
        content:
          "All PO validation failures with Excel row, record type, field and character positions.",
      },
      { property: "og:title", content: "Validation Errors" },
      {
        property: "og:description",
        content: "PO validation failures with Excel row, field and character positions.",
      },
    ],
  }),
  component: ValidationErrors,
});

function ValidationErrors() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["conversions"],
    queryFn: () => listConversionsFn(),
  });
  const rows = data.flatMap((c) =>
    [...c.errors, ...c.warnings].map((issue) => ({ conversionId: c.id, ...issue })),
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Validation Errors" }]} />
        
        <PageHeader
          title="Validation Errors"
          subtitle="All recorded validation issues across conversions"
          count={rows.length}
        />

        <Section title="All Issues" collapsible={false}>
          <DataTable
            columns={[
              { key: "severity", header: "Severity", width: "80px" },
              { key: "conversionId", header: "Conversion ID", width: "120px" },
              { key: "excelRow", header: "Excel Row", width: "80px" },
              { key: "recordType", header: "Record Type", width: "100px" },
              { key: "field", header: "Field", width: "100px" },
              { key: "code", header: "Code", width: "80px" },
              { key: "positions", header: "Positions", width: "100px" },
              { key: "value", header: "Value", width: "150px" },
              { key: "message", header: "Message" },
            ]}
            data={rows.map((r) => ({
              severity: (
                <span className={`text-xs font-medium ${
                  r.severity === "error"
                    ? "text-status-error"
                    : "text-status-warning"
                }`}>
                  {r.severity}
                </span>
              ),
              conversionId: r.conversionId,
              excelRow: r.excelRow ?? "—",
              recordType: r.recordType ?? "—",
              field: r.field ?? "—",
              code: r.code,
              positions: r.fromPosition ? `${r.fromPosition}–${r.toPosition}` : "—",
              value: r.value ?? "",
              message: r.message,
            }))}
            loading={isLoading}
            empty="No validation issues recorded yet."
          />
        </Section>
      </div>
    </AppShell>
  );
}
