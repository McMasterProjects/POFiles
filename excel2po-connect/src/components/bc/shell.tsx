import { Link, useRouterState } from "@tanstack/react-router";
import {
  FileSpreadsheet,
  Menu,
  X,
  ChevronRight,
  Search,
  Bell,
  User,
  ChevronDown,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "File Converter", icon: FileSpreadsheet },
  { to: "/po-to-excel", label: "Open in Excel", icon: FileSpreadsheet },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActiveRoute = (to: string) => {
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 top-0 z-50 flex h-12 items-center gap-3 border-b border-border bg-card px-4 shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="inline-flex items-center justify-center rounded p-1 hover:bg-muted"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Excel2PO</span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            className="inline-flex items-center justify-center rounded p-2 hover:bg-muted"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            className="inline-flex items-center justify-center rounded p-2 hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-muted"
            aria-label="User menu"
          >
            <User className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 mt-12 flex w-56 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex-1 space-y-1 overflow-auto p-2">
          {NAV.map((item) => {
            const active = isActiveRoute(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-all ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <p className="text-xs font-semibold text-sidebar-foreground/70">MATES PO</p>
          <p className="text-xs text-sidebar-foreground/60">v2.18</p>
        </div>
      </aside>

      <div
        className={`ml-0 flex min-w-0 flex-1 flex-col pt-12 transition-all ${
          sidebarOpen ? "pl-56" : "pl-0"
        }`}
      >
        <main className="min-w-0 flex-1 overflow-auto bg-background p-6">{children}</main>
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

export function PageHeader({
  title,
  subtitle,
  count,
  actions,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  actions?: {
    label: string;
    onClick: () => void;
    primary?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-sm border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          {count !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {count} {count === 1 ? "record" : "records"}
            </p>
          )}
        </div>
        {actions && actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className={`inline-flex items-center gap-1 rounded-sm px-3 py-2 text-sm font-medium transition-all ${
                    action.primary
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                      : "border border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityTile({
  label,
  value,
  color,
  onClick,
  accent,
}: {
  label: string;
  value: string | number;
  color?: "blue" | "green" | "orange" | "red" | "gray";
  onClick?: () => void;
  accent?: boolean;
}) {
  const colorClass: Record<string, string> = {
    blue: "border-l-primary bg-blue-50",
    green: "border-l-status-valid bg-green-50",
    orange: "border-l-status-warning bg-yellow-50",
    red: "border-l-status-error bg-red-50",
    gray: "border-l-status-idle bg-gray-50",
  };

  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-2 border-l-4 rounded-sm border border-border p-4 ${colorClass[color || "gray"]} cursor-pointer transition-all hover:shadow-sm ${
        onClick ? "hover:border-primary" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="bc-label uppercase">{label}</span>
        {accent && <span className="bc-activity-tile-accent" />}
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
    </div>
  );
}

export function ActivityTileGroup({
  title,
  tiles,
}: {
  title?: string;
  tiles: {
    label: string;
    value: string | number;
    color?: "blue" | "green" | "orange" | "red" | "gray";
    onClick?: () => void;
  }[];
}) {
  return (
    <div className="mb-4">
      {title && <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile, idx) => (
          <ActivityTile key={idx} {...tile} />
        ))}
      </div>
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && <ChevronRight className="h-3 w-3" />}
          {item.href ? (
            <Link to={item.href} className="hover:text-primary hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function DataTable({
  columns,
  data,
  loading,
  empty,
  selectable,
  selectedRows,
  onSelectedRowsChange,
}: {
  columns: { key: string; header: string; width?: string }[];
  data: Record<string, unknown>[];
  loading?: boolean;
  empty?: string;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectedRowsChange?: (rows: Set<string>) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-sm border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-sm border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">{empty || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border bg-card">
      <table className="bc-table">
        <thead className="bg-muted">
          <tr className="border-b border-border">
            {selectable && (
              <th className="bc-table-header w-10">
                <input
                  type="checkbox"
                  checked={selectedRows && selectedRows.size === data.length}
                  onChange={(e) => {
                    if (onSelectedRowsChange) {
                      if (e.target.checked) {
                        onSelectedRowsChange(new Set(data.map((row, idx) => String(idx))));
                      } else {
                        onSelectedRowsChange(new Set());
                      }
                    }
                  }}
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className="bc-table-header" style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="bc-table-row border-b border-border">
              {selectable && (
                <td className="bc-table-cell w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows?.has(String(rowIdx)) ?? false}
                    onChange={(e) => {
                      if (onSelectedRowsChange && selectedRows) {
                        const newSet = new Set(selectedRows);
                        if (e.target.checked) {
                          newSet.add(String(rowIdx));
                        } else {
                          newSet.delete(String(rowIdx));
                        }
                        onSelectedRowsChange(newSet);
                      }
                    }}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className="bc-table-cell">
                  {String(row[col.key] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Section({
  title,
  children,
  collapsible,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  if (collapsible) {
    return (
      <details open={defaultOpen} className="mb-4 rounded-sm border border-border bg-card group">
        <summary className="flex cursor-pointer list-none items-center gap-2 border-b border-border px-4 py-3 hover:bg-muted">
          <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </summary>
        <div className="p-4">{children}</div>
      </details>
    );
  }

  return (
    <div className="mb-4 rounded-sm border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function Button({
  children,
  primary,
  disabled,
  icon: Icon,
  onClick,
  type = "button",
  size = "md",
  className,
}: {
  children: ReactNode;
  primary?: boolean;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-sm transition-all font-medium ${
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          : "border border-border bg-card text-foreground hover:bg-muted disabled:opacity-60"
      } ${sizeClass[size]} ${className || ""}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  error,
  helper,
  maxLength,
  required,
}: {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  error?: string;
  helper?: string;
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <div className="mb-3 flex flex-col gap-1">
      {label && (
        <label className="bc-label">
          {label}
          {required && <span className="text-status-error">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`bc-input ${error ? "border-status-error" : ""}`}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
      />
      {error && <p className="text-xs text-status-error">{error}</p>}
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  disabled,
  error,
  required,
  placeholder,
}: {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="mb-3 flex flex-col gap-1">
      {label && (
        <label className="bc-label">
          {label}
          {required && <span className="text-status-error">*</span>}
        </label>
      )}
      <select
        className={`bc-input ${error ? "border-status-error" : ""}`}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-status-error">{error}</p>}
    </div>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
  disabled,
}: {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked || false}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded-sm border border-border cursor-pointer"
      />
      {label && <label className="text-sm cursor-pointer">{label}</label>}
    </div>
  );
}

export function Alert({
  type = "info",
  title,
  message,
  onClose,
}: {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
}) {
  const colorClass = {
    success: "bg-status-valid/10 border-status-valid text-status-valid",
    error: "bg-status-error/10 border-status-error text-status-error",
    warning: "bg-status-warning/10 border-status-warning text-status-warning",
    info: "bg-primary/10 border-primary text-primary",
  };

  return (
    <div className={`rounded-sm border p-3 mb-4 ${colorClass[type]}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          {title && <h4 className="text-sm font-semibold">{title}</h4>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-sm font-medium opacity-70 hover:opacity-100">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
