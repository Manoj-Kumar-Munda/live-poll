import type { LiveQuestion } from "@/shared/types";
import { QuestionCountdown } from "./question-countdown";

type LiveQuestionPanelProps = {
  question: LiveQuestion;
  endsAt: string;
  serverNow: string;
  index: number;
};

export function LiveQuestionPanel({
  question,
  endsAt,
  serverNow,
  index,
}: LiveQuestionPanelProps) {
  return (
    <section className="mt-10 rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Question {index + 1} · {question.type.replace("_", " ")}
        </p>
        <QuestionCountdown endsAt={endsAt} serverNow={serverNow} />
      </div>

      <p className="mt-4 font-display text-xl font-semibold">{question.prompt}</p>

      {question.options ? (
        <ul className="mt-6 space-y-2">
          {question.options.map((option) => (
            <li
              key={option}
              className="rounded-lg border border-border bg-background px-4 py-3 text-sm"
            >
              {option}
            </li>
          ))}
        </ul>
      ) : null}

      {question.maxLength != null ? (
        <p className="mt-4 text-sm text-text-secondary">
          Answer up to {question.maxLength} characters
        </p>
      ) : null}
    </section>
  );
}
