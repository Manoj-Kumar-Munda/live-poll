import { cn } from "@/lib/utils";
import type { SessionStatus } from "@/shared/types";

const LABELS: Record<SessionStatus, string> = {
  WAITING: "Waiting room",
  LIVE: "Live",
  FINISHED: "Finished",
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide",
        status === "WAITING" && "bg-signal/15 text-signal",
        status === "LIVE" && "bg-primary/15 text-primary",
        status === "FINISHED" && "bg-secondary text-text-secondary",
      )}
    >
      {LABELS[status]}
    </span>
  );
}
