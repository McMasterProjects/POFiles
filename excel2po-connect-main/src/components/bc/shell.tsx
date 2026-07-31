import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Columns3,
  History,
  TriangleAlert,
  ScrollText,
  Settings as SettingsIcon,
} from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/", label: "Convert Excel", icon: FileSpreadsheet },
  { to: "/mapping-profiles", label: "Mapping Profiles", icon: Columns3 },
  { to: "/history", label: "Conversion History", icon: History },
  { to: "/validation-errors", label: "Validation Errors", icon: TriangleAlert },
  { to: "/logs", label: "System Logs", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActiveRoute = (to: string) => {
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-56 shrink-0 flex-col bg-nav text-nav-foreground">
        <div className="flex h-11 items-center gap-2 border-b border-sidebar-border px-3 text-[13px] font-semibold">
          <FileSpreadsheet className="h-4 w-4" />
          Excel to PO Converter
        </div>
        <nav className="flex-1 py-1">
          {NAV.map((item) => {
            const active = isActiveRoute(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 border-l-2 px-3 py-1.5 text-[13px] transition-colors ${
                  active
                    ? "border-l-primary bg-sidebar-accent font-semibold"
                    : "border-l-transparent hover:bg-sidebar-accent/60"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-3.5 w-3.5 opacity-80" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border px-3 py-2 text-[11px] opacity-70">
          Mates PO v2.18
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-11 items-center justify-between border-b border-border bg-card px-4">
          <span className="text-[13px] font-semibold text-heading">
            Operations · Paltrack Transmission
          </span>
          <span className="text-[12px] text-muted-foreground">Internal utility</span>
        </header>
        <main className="min-w-0 flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}

export function CommandBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border border-border bg-commandbar px-2 py-1">
      {children}
    </div>
  );
}

export function CommandButton({
  onClick,
  disabled,
  icon: Icon,
  children,
  primary,
}: {
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 text-[12.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "text-foreground hover:bg-accent"
      }`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-2">
      <h1 className="bc-page-title">{title}</h1>
      {subtitle ? <p className="text-[12px] text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

export function FastTab({
  title,
  summary,
  children,
  defaultOpen = true,
}: {
  title: string;
  summary?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="bc-card mb-2 group">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 hover:bg-secondary">
        <span className="text-[13px] font-semibold text-heading">{title}</span>
        <span className="text-[12px] text-muted-foreground">{summary}</span>
      </summary>
      <div className="border-t border-border p-3">{children}</div>
    </details>
  );
}

export type StatusKind = "valid" | "error" | "warning" | "processing" | "idle";

const STATUS_CLASS: Record<StatusKind, string> = {
  valid: "bg-status-valid",
  error: "bg-status-error",
  warning: "bg-status-warning",
  processing: "bg-status-processing",
  idle: "bg-status-idle",
};

export function StatusIndicator({ kind, label }: { kind: StatusKind; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px]">
      <span className={`h-2 w-2 rounded-full ${STATUS_CLASS[kind]}`} />
      {label}
    </span>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="bc-label">{label}</span>
      <input
        className="bc-input focus:border-ring"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
