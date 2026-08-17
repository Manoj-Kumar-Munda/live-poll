import { cn } from "@/lib/utils";
import type { QuizStatus } from "../types";

const LABELS: Record<QuizStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export function StatusBadge({ status }: { status: QuizStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide",
        status === "DRAFT" && "bg-muted text-text-secondary",
        status === "PUBLISHED" && "bg-signal/15 text-signal",
        status === "ARCHIVED" && "bg-secondary text-text-secondary",
      )}
    >
      {LABELS[status]}
    </span>
  );
}
