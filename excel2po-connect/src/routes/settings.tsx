import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AppShell,
  PageHeader,
  Section,
  Input,
  Checkbox,
  Button,
  Breadcrumb,
} from "@/components/bc/shell";
import { loadAppSettingsFn, saveAppSettingsFn } from "@/lib/po/conversion.functions";

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
      {
        name: "description",
        content: "Default PO header values, output encoding and validation behaviour.",
      },
      { property: "og:title", content: "Converter Settings" },
      {
        property: "og:description",
        content: "Default PO header values, encoding and validation behaviour.",
      },
    ],
  }),
  component: Settings,
});

function Settings() {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    void (async () => {
      try {
        const serverSettings = await loadAppSettingsFn();
        const stored = window.localStorage.getItem(KEY);
        const parsed = serverSettings ?? (stored ? JSON.parse(stored) : null);
        if (parsed) setSettings({ ...DEFAULTS, ...parsed });
      } catch {}
    })();
  }, []);

  const set = (key: keyof typeof DEFAULTS, value: string | boolean) =>
    setSettings((s) => ({ ...s, [key]: value }));

  return (
    <AppShell>
      <div className="space-y-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Settings" }]} />

        <PageHeader title="Settings" subtitle="Configure default values for your conversions" />

        <Section title="Header Defaults" collapsible={false}>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Source Address"
              value={settings.sourceAddress}
              onChange={(v) => set("sourceAddress", v)}
              maxLength={3}
            />
            <Input
              label="Destination Address"
              value={settings.destinationAddress}
              onChange={(v) => set("destinationAddress", v)}
              maxLength={3}
            />
            <Input
              label="Provider"
              value={settings.provider}
              onChange={(v) => set("provider", v)}
            />
            <Input
              label="Version"
              value={settings.version}
              onChange={(v) => set("version", v)}
            />
            <Input
              label="Organisation Code"
              value={settings.organisationCode}
              onChange={(v) => set("organisationCode", v)}
              maxLength={2}
            />
            <Input
              label="Country Code"
              value={settings.countryCode}
              onChange={(v) => set("countryCode", v)}
              maxLength={2}
            />
            <Input
              label="Channel"
              value={settings.channel}
              onChange={(v) => set("channel", v)}
              maxLength={1}
            />
            <Input
              label="Output Encoding"
              value={settings.encoding}
              onChange={(v) => set("encoding", v)}
            />
            <Input
              label="File Retention (days)"
              value={settings.retentionDays}
              onChange={(v) => set("retentionDays", v)}
            />
          </div>
        </Section>

        <Section title="Validation Options" collapsible={false}>
          <div className="space-y-3">
            <Checkbox
              label="Enforce CRLF line endings"
              checked={settings.enforceCRLF}
              onChange={(v) => set("enforceCRLF", v)}
            />
            <Checkbox
              label="Allow alpha truncation"
              checked={settings.allowAlphaTruncation}
              onChange={(v) => set("allowAlphaTruncation", v)}
            />
            <Checkbox
              label="Treat warnings as errors"
              checked={settings.treatWarningsAsErrors}
              onChange={(v) => set("treatWarningsAsErrors", v)}
            />
          </div>
        </Section>

        <div className="flex gap-2">
          <Button
            primary
            onClick={async () => {
              try {
                try {
                  window.localStorage.setItem(KEY, JSON.stringify(settings));
                } catch {}
                await saveAppSettingsFn({ data: settings });
                toast.success("Settings saved successfully");
              } catch {
                toast.error("Failed to save settings");
              }
            }}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
