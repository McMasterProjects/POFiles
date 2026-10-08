import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  AppShell,
  PageHeader,
  Section,
  DataTable,
  Button,
  Input,
  Breadcrumb,
} from "@/components/bc/shell";
import { listLogsFn } from "@/lib/po/conversion.functions";

export const Route = createFileRoute("/logs")({
  head: () => ({
    meta: [
      { title: "System Logs | Excel to PO Converter" },
      {
        name: "description",
        content: "Structured backend processing logs for every Excel to PO conversion stage.",
      },
      { property: "og:title", content: "System Logs" },
      {
        property: "og:description",
        content: "Structured backend processing logs per conversion stage.",
      },
    ],
  }),
  component: Logs,
});

function Logs() {
  const {
    data = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["logs"],
    queryFn: () => listLogsFn(),
  });
  const [filter, setFilter] = useState("");

  const rows = data.filter((l) =>
    filter
      ? `${l.conversionId} ${l.level} ${l.module} ${l.action} ${l.message ?? ""}`
          .toLowerCase()
          .includes(filter.toLowerCase())
      : true,
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "System Logs" }]} />

        <PageHeader
          title="System Logs"
          subtitle="Processing logs for all conversions"
          count={rows.length}
          actions={[
            {
              label: "Refresh",
              icon: RefreshCw,
              onClick: () => refetch(),
            },
          ]}
        />

        <Section title="Filter Logs" collapsible={true}>
          <Input
            label="Search"
            placeholder="Filter by conversion ID, level, module or message"
            value={filter}
            onChange={(e) => setFilter(e)}
          />
        </Section>

        <Section title="All Logs" collapsible={false}>
          <DataTable
            columns={[
              { key: "timestamp", header: "Timestamp", width: "140px" },
              { key: "level", header: "Level", width: "80px" },
              { key: "conversionId", header: "Conversion ID", width: "120px" },
              { key: "module", header: "Module", width: "100px" },
              { key: "action", header: "Action", width: "100px" },
              { key: "excelRow", header: "Row", width: "70px" },
              { key: "field", header: "Field", width: "100px" },
              { key: "message", header: "Message" },
            ]}
            data={rows.map((l) => ({
              timestamp: l.timestamp,
              level: (
                <span
                  className={`text-xs font-medium ${
                    l.level === "error"
                      ? "text-status-error"
                      : l.level === "warn"
                        ? "text-status-warning"
                        : "text-muted-foreground"
                  }`}
                >
                  {l.level}
                </span>
              ),
              conversionId: l.conversionId,
              module: l.module,
              action: l.action,
              excelRow: l.excelRow ?? "",
              field: l.field ?? "",
              message: l.message ?? "",
            }))}
            loading={isLoading}
            empty="No log entries found."
          />
        </Section>
      </div>
    </AppShell>
  );
}
