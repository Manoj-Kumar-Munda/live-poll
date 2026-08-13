import { Users } from "lucide-react";

const options = [
  { label: "Photosynthesis", barClass: "bar-a", pct: "68%", highlight: true },
  { label: "Respiration", barClass: "bar-b", pct: "22%" },
  { label: "Osmosis", barClass: "bar-c", pct: "7%" },
  { label: "Diffusion", barClass: "bar-d", pct: "3%" },
];

export function LivePreview() {
  return (
    <div
      className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] sm:p-6"
      aria-hidden="true"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="live-badge inline-flex items-center gap-1.5 rounded-full bg-signal/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-signal">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            Live
          </span>
          <span className="font-mono text-xs text-text-muted">Room AB7K2M</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Users size={14} aria-hidden />
          <span className="font-mono tabular-nums">142</span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-spotlight/15 font-mono text-sm font-semibold tabular-nums text-spotlight"
        >
          18
        </div>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full w-[60%] rounded-full bg-spotlight/80"
            style={{ transition: "width 1s linear" }}
          />
        </div>
      </div>

      <p className="mb-5 font-display text-base font-semibold leading-snug text-text-primary sm:text-lg">
        Which process converts light energy into chemical energy?
      </p>

      <div className="space-y-2.5">
        {options.map((opt) => (
          <div key={opt.label} className="group">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span
                className={
                  opt.highlight
                    ? "font-medium text-signal"
                    : "text-text-secondary"
                }
              >
                {opt.label}
                {opt.highlight && (
                  <span className="ml-1.5 text-[10px] uppercase tracking-wide text-signal/70">
                    correct
                  </span>
                )}
              </span>
              <span className="font-mono tabular-nums text-text-muted">
                {opt.pct}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
              <div
                className={`h-full rounded-full ${opt.barClass} ${
                  opt.highlight ? "bg-signal" : "bg-electric/60"
                }`}
                style={{ width: opt.pct }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-electric/10 blur-2xl"
        aria-hidden="true"
      />
    </div>
  );
}
