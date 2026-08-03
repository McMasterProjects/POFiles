import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageTitle, StatusIndicator } from "@/components/bc/shell";
import { listConversionsFn } from "@/lib/po/conversion.functions";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Conversion History | Excel to PO Converter" },
      {
        name: "description",
        content: "Every Excel to Paltrack PO conversion with record, pallet and carton totals.",
      },
      { property: "og:title", content: "Conversion History" },
      {
        property: "og:description",
        content: "Every Excel to Paltrack PO conversion with totals and status.",
      },
    ],
  }),
  component: History,
});

function History() {
  const { data = [] } = useQuery({ queryKey: ["conversions"], queryFn: () => listConversionsFn() });
  return (
    <AppShell>
      <PageTitle title="Conversion History" />
      <div className="bc-card overflow-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead className="bg-secondary text-left">
            <tr>
              {[
                "Conversion ID",
                "Source File",
                "Output File",
                "Status",
                "Pallets",
                "Cartons",
                "Errors",
                "Created",
                "Completed",
              ].map((h) => (
                <th key={h} className="border-r border-border px-2 py-1 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="border-r border-border px-2 py-1">{c.id}</td>
                <td className="border-r border-border px-2 py-1">{c.sourceFileName}</td>
                <td className="border-r border-border px-2 py-1">{c.outputFileName}</td>
                <td className="border-r border-border px-2 py-1">
                  <StatusIndicator
                    kind={c.status === "Completed" ? "valid" : "error"}
                    label={c.status}
                  />
                </td>
                <td className="border-r border-border px-2 py-1">{c.palletCount}</td>
                <td className="border-r border-border px-2 py-1">{c.cartonCount}</td>
                <td className="border-r border-border px-2 py-1">{c.errors.length}</td>
                <td className="border-r border-border px-2 py-1">
                  {new Date(c.createdAt).toLocaleString()}
                </td>
                <td className="px-2 py-1">
                  {c.completedAt ? new Date(c.completedAt).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
            {!data.length ? (
              <tr>
                <td className="px-2 py-2 text-muted-foreground" colSpan={9}>
                  No conversions recorded.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
