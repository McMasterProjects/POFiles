import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageTitle, StatusIndicator } from "@/components/bc/shell";
import { listConversionsFn, healthFn } from "@/lib/po/conversion.functions";

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
  const { data = [] } = useQuery({ queryKey: ["conversions"], queryFn: () => listConversionsFn() });
  const { data: health } = useQuery({ queryKey: ["health"], queryFn: () => healthFn() });

  const today = new Date().toISOString().slice(0, 10);
  const todays = data.filter((c) => c.createdAt.startsWith(today));
  const ok = data.filter((c) => c.status === "Completed");
  const failed = data.filter((c) => c.status !== "Completed");

  return (
    <AppShell>
      <PageTitle
        title="Dashboard"
        subtitle={`Backend ${health?.status ?? "…"} · v${health?.version ?? "-"}`}
      />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Tile label="Conversions today" value={todays.length} />
        <Tile label="Successful" value={ok.length} />
        <Tile label="Failed" value={failed.length} />
        <Tile
          label="Awaiting validation"
          value={data.filter((c) => c.status === "Validation Failed").length}
        />
        <Tile label="Pallet records" value={data.reduce((s, c) => s + c.palletCount, 0)} />
      </div>

      <div className="bc-card mt-3">
        <div className="border-b border-border px-3 py-2 text-[13px] font-semibold text-heading">
          Recent conversions
        </div>
        <table className="w-full border-collapse text-[12px]">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="px-2 py-1">Conversion ID</th>
              <th className="px-2 py-1">Source</th>
              <th className="px-2 py-1">Output</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Pallets</th>
              <th className="px-2 py-1">Cartons</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-2 py-1">{c.id}</td>
                <td className="px-2 py-1">{c.sourceFileName}</td>
                <td className="px-2 py-1">{c.outputFileName}</td>
                <td className="px-2 py-1">
                  <StatusIndicator
                    kind={c.status === "Completed" ? "valid" : "error"}
                    label={c.status}
                  />
                </td>
                <td className="px-2 py-1">{c.palletCount}</td>
                <td className="px-2 py-1">{c.cartonCount}</td>
              </tr>
            ))}
            {!data.length ? (
              <tr>
                <td className="px-2 py-2 text-muted-foreground" colSpan={6}>
                  No conversions yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bc-card p-3">
      <div className="bc-label">{label}</div>
      <div className="text-2xl font-semibold text-heading">{value}</div>
    </div>
  );
}
