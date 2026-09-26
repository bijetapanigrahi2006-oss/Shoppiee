import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  gradient = "linear-gradient(135deg,#a855f7,#ec4899)",
  children,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  gradient?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card relative overflow-hidden p-12 text-center">
      <div className="pointer-events-none absolute left-1/2 top-6 h-40 w-40 -translate-x-1/2 rounded-full opacity-40 blur-3xl" style={{ background: gradient }} />
      <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl text-white shadow-xl" style={{ background: gradient }}>
        <Icon className="h-8 w-8" />
      </span>
      <p className="relative mt-4 font-display text-xl font-semibold">{title}</p>
      {body && <p className="relative mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {children && <div className="relative mt-5 flex justify-center gap-2">{children}</div>}
    </div>
  );
}
