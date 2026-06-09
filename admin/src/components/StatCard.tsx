import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm text-[var(--muted-foreground)]">{label}</div>
        <div className="text-[var(--accent)]">{icon}</div>
      </div>
      <div className="font-heading text-4xl">{value}</div>
    </div>
  );
}
