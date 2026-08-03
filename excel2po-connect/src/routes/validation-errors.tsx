import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageTitle, StatusIndicator } from "@/components/bc/shell";
import { listConversionsFn } from "@/lib/po/conversion.functions";

export const Route = createFileRoute("/validation-errors")({
  head: () => ({
    meta: [
      { title: "Validation Errors | Excel to PO Converter" },
      { name: "description", content: "All PO validation failures with Excel row, record type, field and character positions." },
      { property: "og:title", content: "Validation Errors" },
      { property: "og:description", content: "PO validation failures with Excel row, field and character positions." },
    ],
  }),
  component: ValidationErrors,
});

function ValidationErrors() {
  const { data = [] } = useQuery({ queryKey: ["conversions"], queryFn: () => listConversionsFn() });
  const rows = data.flatMap((c) =>
    [...c.errors, ...c.warnings].map((issue) => ({ conversionId: c.id, ...issue })),
  );

  return (
    <AppShell>
      <PageTitle title="Validation Errors" subtitle={`${rows.length} recorded issue(s)`} />
      <div className="bc-card overflow-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead className="bg-secondary text-left">
            <tr>
              {["Severity", "Conversion", "Excel Row", "Record", "Field", "Code", "Positions", "Value", "Message"].map((h) => (
                <th key={h} className="border-r border-border px-2 py-1 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="border-r border-border px-2 py-1">
                  <StatusIndicator kind={r.severity === "error" ? "error" : "warning"} label={r.severity} />
                </td>
                <td className="border-r border-border px-2 py-1">{r.conversionId}</td>
                <td className="border-r border-border px-2 py-1">{r.excelRow ?? "—"}</td>
                <td className="border-r border-border px-2 py-1">{r.recordType ?? "—"}</td>
                <td className="border-r border-border px-2 py-1">{r.field ?? "—"}</td>
                <td className="border-r border-border px-2 py-1">{r.code}</td>
                <td className="border-r border-border px-2 py-1">
                  {r.fromPosition ? `${r.fromPosition}–${r.toPosition}` : "—"}
                </td>
                <td className="border-r border-border px-2 py-1">{r.value ?? ""}</td>
                <td className="px-2 py-1">{r.message}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr><td className="px-2 py-2 text-muted-foreground" colSpan={9}>No validation issues recorded.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
