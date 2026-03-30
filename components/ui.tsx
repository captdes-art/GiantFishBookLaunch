import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { formatDate, formatDateTime } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actions}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  note
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <section className="card">
      <h3>{label}</h3>
      <p className="metric">{value}</p>
      {note ? <p className="metric-subtle">{note}</p> : null}
    </section>
  );
}

export function Badge({
  label,
  tone = "neutral"
}: {
  label: string | boolean | null | undefined;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const safeLabel = typeof label === "boolean" ? (label ? "Yes" : "No") : label || "—";
  return <span className={`badge ${tone}`}>{safeLabel}</span>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p className="small">{body}</p>
    </div>
  );
}

export function FilterLinks({
  basePath,
  current,
  options
}: {
  basePath: string;
  current: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="filters">
      {options.map((option) => {
        const href = `${basePath}?view=${option.value}` as Route;

        return (
          <Link key={option.value} href={href} className={current === option.value ? "active" : ""}>
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

export function DateCell({ value, time = false }: { value?: string | null; time?: boolean }) {
  return <span>{time ? formatDateTime(value) : formatDate(value)}</span>;
}
