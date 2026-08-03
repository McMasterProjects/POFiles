import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell, PageTitle } from "@/components/bc/shell";
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
  const { data = [], refetch } = useQuery({ queryKey: ["logs"], queryFn: () => listLogsFn() });
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
      <PageTitle title="System Logs" subtitle={`${rows.length} entries`} />
      <div className="mb-2 flex gap-2">
        <input
          className="bc-input max-w-xs"
          placeholder="Filter by conversion ID, level, module or message"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          className="rounded-[2px] border border-input px-2 py-1 text-[12px] hover:bg-accent"
          onClick={() => refetch()}
        >
          Refresh
        </button>
      </div>
      <div className="bc-card max-h-[70vh] overflow-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead className="sticky top-0 bg-secondary text-left">
            <tr>
              {[
                "Timestamp",
                "Level",
                "Conversion ID",
                "Module",
                "Action",
                "Row",
                "Field",
                "Message",
              ].map((h) => (
                <th key={h} className="border-r border-border px-2 py-1 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((l, i) => (
              <tr key={i} className="border-t border-border">
                <td className="border-r border-border px-2 py-1 whitespace-nowrap">
                  {l.timestamp}
                </td>
                <td className="border-r border-border px-2 py-1">{l.level}</td>
                <td className="border-r border-border px-2 py-1">{l.conversionId}</td>
                <td className="border-r border-border px-2 py-1">{l.module}</td>
                <td className="border-r border-border px-2 py-1">{l.action}</td>
                <td className="border-r border-border px-2 py-1">{l.excelRow ?? ""}</td>
                <td className="border-r border-border px-2 py-1">{l.field ?? ""}</td>
                <td className="px-2 py-1">{l.message ?? ""}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td className="px-2 py-2 text-muted-foreground" colSpan={8}>
                  No log entries.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
