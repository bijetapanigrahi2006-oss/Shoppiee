export function Section({ title, subtitle, action, children }: { title: React.ReactNode; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * Page hero: a gradient panel with an icon badge. `gradient` sets the colour
 * story for the page (category colours, feature colours…).
 */
export function PageHeader({
  title,
  subtitle,
  icon,
  gradient = "linear-gradient(135deg,#7c3aed,#db2777 60%,#f59e0b)",
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-[28px] p-6 text-white shadow-2xl sm:p-8" style={{ background: gradient }}>
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-black/20 blur-3xl" />
      <div className="relative flex flex-wrap items-center gap-5">
        {icon && <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 shadow-inner ring-1 ring-white/30 backdrop-blur [&>svg]:h-7 [&>svg]:w-7">{icon}</span>}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-white/85 sm:text-base">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
