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
  const { data = [], isLoading } = useQuery({
    queryKey: ["conversions"],
    queryFn: () => listConversionsFn(),
  });

  return (
    <AppShell>
      <div className="space-y-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Conversion History" }]} />

        <PageHeader
          title="Conversion History"
          subtitle="Track all conversions and their results"
          count={data.length}
        />

        <Section title="All Conversions" collapsible={false}>
          <DataTable
            columns={[
              { key: "id", header: "Conversion ID", width: "120px" },
              { key: "sourceFileName", header: "Source File" },
              { key: "outputFileName", header: "Output File" },
              { key: "status", header: "Status", width: "100px" },
              { key: "palletCount", header: "Pallets", width: "80px" },
              { key: "cartonCount", header: "Cartons", width: "80px" },
              { key: "errorCount", header: "Errors", width: "70px" },
              { key: "createdAt", header: "Created", width: "160px" },
              { key: "completedAt", header: "Completed", width: "160px" },
            ]}
            data={data.map((c) => ({
              id: c.id,
              sourceFileName: c.sourceFileName,
              outputFileName: c.outputFileName,
              status: (
                <span className={`text-xs font-medium ${
                  c.status === "Completed"
                    ? "text-status-valid"
                    : "text-status-error"
                }`}>
                  {c.status}
                </span>
              ),
              palletCount: c.palletCount,
              cartonCount: c.cartonCount,
              errorCount: c.errors.length,
              createdAt: new Date(c.createdAt).toLocaleString(),
              completedAt: c.completedAt
                ? new Date(c.completedAt).toLocaleString()
                : "—",
            }))}
            loading={isLoading}
            empty="No conversions recorded yet."
          />
        </Section>
      </div>
    </AppShell>
  );
}
