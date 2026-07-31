import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, Field, PageTitle } from "@/components/bc/shell";

const KEY = "po-converter-settings";

const DEFAULTS = {
  sourceAddress: "MTS",
  destinationAddress: "000",
  provider: "MATES",
  version: "2.18",
  organisationCode: "GG",
  countryCode: "ZA",
  channel: "E",
  encoding: "windows-1252",
  enforceCRLF: true,
  allowAlphaTruncation: false,
  treatWarningsAsErrors: false,
  retentionDays: "7",
};

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Excel to PO Converter" },
      { name: "description", content: "Default PO header values, output encoding and validation behaviour." },
      { property: "og:title", content: "Converter Settings" },
      { property: "og:description", content: "Default PO header values, encoding and validation behaviour." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored) setSettings({ ...DEFAULTS, ...JSON.parse(stored) });
  }, []);

  const set = (key: keyof typeof DEFAULTS, value: string | boolean) =>
    setSettings((s) => ({ ...s, [key]: value }));

  return (
    <AppShell>
      <PageTitle title="Settings" subtitle="Defaults applied to new conversions." />
      <div className="bc-card max-w-3xl p-3">
        <div className="grid gap-2 md:grid-cols-3">
          <Field label="Default source address" value={settings.sourceAddress} onChange={(v) => set("sourceAddress", v)} maxLength={3} />
          <Field label="Default destination address" value={settings.destinationAddress} onChange={(v) => set("destinationAddress", v)} maxLength={3} />
          <Field label="Provider" value={settings.provider} onChange={(v) => set("provider", v)} />
          <Field label="Version" value={settings.version} onChange={(v) => set("version", v)} />
          <Field label="Default organisation" value={settings.organisationCode} onChange={(v) => set("organisationCode", v)} maxLength={2} />
          <Field label="Default country" value={settings.countryCode} onChange={(v) => set("countryCode", v)} maxLength={2} />
          <Field label="Default channel" value={settings.channel} onChange={(v) => set("channel", v)} maxLength={1} />
          <Field label="Output encoding" value={settings.encoding} onChange={(v) => set("encoding", v)} />
          <Field label="File retention (days)" value={settings.retentionDays} onChange={(v) => set("retentionDays", v)} />
        </div>

        <div className="mt-3 space-y-1 text-[12.5px]">
          <Toggle label="Enforce CRLF line endings" checked={settings.enforceCRLF} onChange={(v) => set("enforceCRLF", v)} />
          <Toggle label="Allow alpha truncation" checked={settings.allowAlphaTruncation} onChange={(v) => set("allowAlphaTruncation", v)} />
          <Toggle label="Treat warnings as errors" checked={settings.treatWarningsAsErrors} onChange={(v) => set("treatWarningsAsErrors", v)} />
        </div>

        <button
          className="mt-3 rounded-[2px] bg-primary px-3 py-1 text-[12.5px] text-primary-foreground hover:bg-primary/90"
          onClick={() => {
            window.localStorage.setItem(KEY, JSON.stringify(settings));
            toast.success("Settings saved");
          }}
        >
          Save settings
        </button>
      </div>
    </AppShell>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
