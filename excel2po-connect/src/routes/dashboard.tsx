import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AppShell,
  PageHeader,
  ActivityTileGroup,
  Section,
  DataTable,
  Button,
  Breadcrumb,
} from "@/components/bc/shell";
import { listConversionsFn, healthFn } from "@/lib/po/conversion.functions";
import { BarChart, Download, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Conversion Dashboard | Excel to PO Converter" },
      {
        name: "description",
        content: "Daily conversion counts, failures and recent Paltrack PO activity.",
      },
      { property: "og:title", content: "Conversion Dashboard" },
      {
        property: "og:description",
        content: "Daily conversion counts, failures and recent Paltrack PO activity.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["conversions"],
    queryFn: () => listConversionsFn(),
  });
  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: () => healthFn(),
  });

  const normalizedData = (Array.isArray(data) ? data : []).map((c) => ({
    ...c,
    status: c?.status ?? "Unknown",
    sourceFileName: c?.sourceFileName ?? "",
    outputFileName: c?.outputFileName ?? "",
    createdAt: c?.createdAt ?? new Date().toISOString(),
    palletCount: Number(c?.palletCount ?? 0),
    cartonCount: Number(c?.cartonCount ?? 0),
  }));

  const [activeFilter, setActiveFilter] = useState<"all" | "today" | "successful" | "failed" | "validation">("all");
  const filterLabel =
    activeFilter === "all"
      ? "all"
      : activeFilter === "today"
        ? "today"
        : activeFilter === "successful"
          ? "successful"
          : activeFilter === "failed"
            ? "failed"
            : "validation";

  const today = new Date().toISOString().slice(0, 10);
  const todays = normalizedData.filter((c) => (c.createdAt ?? "").startsWith(today));
  const ok = normalizedData.filter((c) => c.status === "Completed");
  const failed = normalizedData.filter((c) => c.status !== "Completed");
  const validationFailed = normalizedData.filter((c) => c.status === "Validation Failed");

  const filteredData = normalizedData.filter((c) => {
    switch (activeFilter) {
      case "today":
        return c.createdAt.startsWith(today);
      case "successful":
        return c.status === "Completed";
      case "failed":
        return c.status !== "Completed";
      case "validation":
        return c.status === "Validation Failed";
      case "all":
      default:
        return true;
    }
  });

  const exportReport = () => {
    const rows = [
      ["Conversion ID", "Source File", "Output File", "Status", "Pallets", "Cartons", "Created At"],
      ...filteredData.map((c) => [
        c.id,
        c.sourceFileName,
        c.outputFileName,
        c.status,
        String(c.palletCount),
        String(c.cartonCount),
        new Date(c.createdAt).toISOString(),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `po-dashboard-${activeFilter}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
        />

        {/* Page Header */}
        <PageHeader
          title="Dashboard"
          subtitle={`Backend ${health?.status ?? "…"} · v${health?.version ?? "-"}`}
          actions={[
            {
              label: "Refresh",
              icon: RefreshCw,
              onClick: () => void refetch(),
            },
            {
              label: "Export Report",
              icon: Download,
              primary: true,
              onClick: exportReport,
            },
          ]}
        />

        {/* Activity Tiles */}
        <ActivityTileGroup
          title="Quick Statistics"
          tiles={[
            {
              label: "Today's Conversions",
              value: todays.length,
              color: "blue",
              onClick: () => setActiveFilter("today"),
            },
            {
              label: "Successful",
              value: ok.length,
              color: "green",
              onClick: () => setActiveFilter("successful"),
            },
            {
              label: "Failed",
              value: failed.length,
              color: "red",
              onClick: () => setActiveFilter("failed"),
            },
            {
              label: "Awaiting Validation",
              value: validationFailed.length,
              color: "orange",
              onClick: () => setActiveFilter("validation"),
            },
          ]}
        />

        {/* Recent Activity Section */}
        <Section title="Recent Conversions" collapsible={false}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-[12px] text-muted-foreground">
              Filter: <span className="font-semibold capitalize text-foreground">{filterLabel}</span>
            </span>
            {activeFilter !== "all" ? (
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className="text-[12px] text-primary underline-offset-2 hover:underline"
              >
                Show all
              </button>
            ) : null}
          </div>
          {filteredData.length === 0 && !isLoading ? (
            <div className="rounded border border-dashed border-border bg-muted p-4 text-[12.5px] text-muted-foreground">
              No saved records for this filter yet. Upload an Excel file and generate a PO to populate the dashboard.
            </div>
          ) : (
            <DataTable
            columns={[
              { key: "id", header: "Conversion ID", width: "120px" },
              { key: "sourceFileName", header: "Source File", width: "200px" },
              { key: "outputFileName", header: "Output File", width: "200px" },
              { key: "status", header: "Status", width: "120px" },
              { key: "palletCount", header: "Pallets", width: "80px" },
              { key: "cartonCount", header: "Cartons", width: "80px" },
              { key: "createdAt", header: "Date", width: "150px" },
            ]}
              data={filteredData.slice(0, 10).map((c) => ({
                id: c.id,
                sourceFileName: c.sourceFileName,
                outputFileName: c.outputFileName,
                status: (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                    c.status === "Completed"
                      ? "text-status-valid"
                      : "text-status-error"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      c.status === "Completed"
                        ? "bg-status-valid"
                        : "bg-status-error"
                    }`} />
                    {c.status}
                  </span>
                ),
                palletCount: c.palletCount,
                cartonCount: c.cartonCount,
                createdAt: new Date(c.createdAt).toLocaleString(),
              }))}
              loading={isLoading}
              empty={
                activeFilter === "all"
                  ? "No conversions yet. Start by uploading an Excel file."
                  : `No ${activeFilter} conversions available.`
              }
            />
          )}
        </Section>

        {/* Summary Stats */}
        <Section title="Summary" collapsible={true}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-sm border border-border bg-muted p-3">
              <p className="text-xs font-semibold text-muted-foreground">Total Records</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {normalizedData.reduce((s, c) => s + (Number(c.palletCount) || 0), 0)}
              </p>
            </div>
            <div className="rounded-sm border border-border bg-muted p-3">
              <p className="text-xs font-semibold text-muted-foreground">Success Rate</p>
              <p className="mt-1 text-2xl font-bold text-status-valid">
                {normalizedData.length ? Math.round((ok.length / normalizedData.length) * 100) : 0}%
              </p>
            </div>
            <div className="rounded-sm border border-border bg-muted p-3">
              <p className="text-xs font-semibold text-muted-foreground">Avg Records/Conversion</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {normalizedData.length ? Math.round(normalizedData.reduce((s, c) => s + (Number(c.palletCount) || 0), 0) / normalizedData.length) : 0}
              </p>
            </div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
