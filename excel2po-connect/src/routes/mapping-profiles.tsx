import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  AppShell,
  PageHeader,
  Section,
  DataTable,
  Breadcrumb,
} from "@/components/bc/shell";
import { deleteMappingProfileFn, listMappingProfilesFn } from "@/lib/po/conversion.functions";

export const Route = createFileRoute("/mapping-profiles")({
  head: () => ({
    meta: [
      { title: "Mapping Profiles | Excel to PO Converter" },
      {
        name: "description",
        content: "Reusable Excel column to PO field mapping profiles for .",
      },
      { property: "og:title", content: "Mapping Profiles" },
      {
        property: "og:description",
        content: "Reusable Excel column to PO field mapping profiles.",
      },
    ],
  }),
  component: MappingProfiles,
});

function MappingProfiles() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => listMappingProfilesFn(),
  });

  return (
    <AppShell>
      <div className="space-y-4">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Mapping Profiles" }]}
        />
        
        <PageHeader
          title="Mapping Profiles"
          subtitle="Saved column mappings from your conversions"
          count={data.length}
        />

        <Section title="All Profiles" collapsible={false}>
          <DataTable
            columns={[
              { key: "name", header: "Profile Name" },
              { key: "mappedFields", header: "Mapped Fields", width: "120px" },
              { key: "createdAt", header: "Created", width: "180px" },
              { key: "actions", header: "Actions", width: "100px" },
            ]}
            data={data.map((p) => ({
              name: p.name,
              mappedFields: Object.keys(p.mapping).length,
              createdAt: new Date(p.createdAt).toLocaleString(),
              actions: (
                <button
                  className="text-sm text-destructive hover:underline font-medium"
                  onClick={async () => {
                    if (confirm(`Delete profile "${p.name}"?`)) {
                      await deleteMappingProfileFn({ data: { id: p.id } });
                      await qc.invalidateQueries({ queryKey: ["profiles"] });
                      toast.success("Profile deleted");
                    }
                  }}
                >
                  Delete
                </button>
              ),
            }))}
            loading={isLoading}
            empty="No mapping profiles saved yet. Create one by mapping columns on the File Converter page."
          />
        </Section>
      </div>
    </AppShell>
  );
}
