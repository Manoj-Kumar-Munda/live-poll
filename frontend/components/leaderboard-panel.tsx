import type { LeaderboardEntry } from "@/shared/types";
import { cn } from "@/lib/utils";

type LeaderboardPanelProps = {
  entries: LeaderboardEntry[];
  final?: boolean;
  highlightUserId?: string;
};

export function LeaderboardPanel({
  entries,
  final = false,
  highlightUserId,
}: LeaderboardPanelProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 rounded-xl border border-border bg-surface p-6">
      <h3 className="font-display text-lg font-semibold">
        {final ? "Final leaderboard" : "Leaderboard"}
      </h3>

      <ol className="mt-4 space-y-2">
        {entries.map((entry) => {
          const isHighlighted = highlightUserId === entry.userId;

          return (
            <li
              key={entry.userId}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm",
                isHighlighted
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-background",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-8 shrink-0 font-mono text-xs font-semibold text-text-muted">
                  #{entry.rank}
                </span>
                <span className="truncate font-medium">{entry.displayName}</span>
              </div>
              <span className="shrink-0 font-mono tabular-nums text-text-secondary">
                {entry.score} pts
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
