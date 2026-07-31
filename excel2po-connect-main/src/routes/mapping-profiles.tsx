import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell, PageTitle } from "@/components/bc/shell";
import { deleteMappingProfileFn, listMappingProfilesFn } from "@/lib/po/conversion.functions";

export const Route = createFileRoute("/mapping-profiles")({
  head: () => ({
    meta: [
      { title: "Mapping Profiles | Excel to PO Converter" },
      { name: "description", content: "Reusable Excel column to PO field mapping profiles for Paltrack transmissions." },
      { property: "og:title", content: "Mapping Profiles" },
      { property: "og:description", content: "Reusable Excel column to PO field mapping profiles." },
    ],
  }),
  component: MappingProfiles,
});

function MappingProfiles() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["profiles"], queryFn: () => listMappingProfilesFn() });

  return (
    <AppShell>
      <PageTitle title="Mapping Profiles" subtitle="Saved from the Column Mapping FastTab on the conversion page." />
      <div className="bc-card overflow-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead className="bg-secondary text-left">
            <tr>
              {["Name", "Mapped Fields", "Created", ""].map((h) => (
                <th key={h} className="border-r border-border px-2 py-1">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="border-r border-border px-2 py-1">{p.name}</td>
                <td className="border-r border-border px-2 py-1">{Object.keys(p.mapping).length}</td>
                <td className="border-r border-border px-2 py-1">{new Date(p.createdAt).toLocaleString()}</td>
                <td className="px-2 py-1">
                  <button
                    className="text-destructive hover:underline"
                    onClick={async () => {
                      await deleteMappingProfileFn({ data: { id: p.id } });
                      await qc.invalidateQueries({ queryKey: ["profiles"] });
                      toast.success("Profile deleted");
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!data.length ? (
              <tr><td className="px-2 py-2 text-muted-foreground" colSpan={4}>No mapping profiles saved.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
