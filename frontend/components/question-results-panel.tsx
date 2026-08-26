"use client";

import type { QuestionResultsPayload } from "@/shared/types";
import { OptionResultRow } from "./option-result-row";
import { WordCloudPanel } from "./word-cloud-panel";

type QuestionResultsPanelProps = {
  results: QuestionResultsPayload;
  mode?: "host" | "participant";
  yourAnswer?: string | null;
};

export function QuestionResultsPanel({
  results,
  mode = "host",
  yourAnswer = null,
}: QuestionResultsPanelProps) {
  const isOpenText = results.question.type === "OPEN_TEXT";
  const isMcq = results.question.type === "MCQ";
  const isPoll = results.question.type === "POLL";
  const normalizedYourAnswer = yourAnswer?.trim().toLowerCase() ?? null;
  const normalizedCorrect = results.correctAnswer?.toLowerCase();

  const yourWasCorrect =
    isMcq &&
    normalizedYourAnswer !== null &&
    normalizedCorrect !== undefined &&
    normalizedYourAnswer === normalizedCorrect;

  const wordCloudTerms =
    results.wordResults?.map((term) => ({
      key: term.key,
      label: term.label,
      count: term.count,
    })) ?? [];

  if (isOpenText) {
    return (
      <section className="mt-10">
        <WordCloudPanel
          terms={wordCloudTerms}
          questionKey={`${results.sessionId}-${results.index}-results`}
          mode="results"
          highlightedKey={mode === "participant" ? normalizedYourAnswer : null}
          answerCount={results.totalAnswers}
        />

        <div className="mt-4 rounded-xl border border-border bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Question {results.index + 1} results · Open text
          </p>
          <p className="mt-4 font-display text-xl font-semibold">
            {results.question.prompt}
          </p>

          {mode === "participant" && normalizedYourAnswer !== null ? (
            <p className="mt-4 text-sm font-medium text-text-secondary">
              Thanks for your response!
            </p>
          ) : null}

          {mode === "participant" && normalizedYourAnswer === null ? (
            <p className="mt-4 text-sm text-text-secondary">
              You didn&apos;t answer this question.
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  const optionResults = results.optionResults ?? [];

  return (
    <section className="mt-10 rounded-xl border border-border bg-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        Question {results.index + 1} results ·{" "}
        {results.question.type.replace("_", " ")}
      </p>

      <p className="mt-4 font-display text-xl font-semibold">
        {results.question.prompt}
      </p>

      <ul className="mt-6 space-y-2">
        {optionResults.map((row) => {
          const isCorrect =
            isMcq && row.option.toLowerCase() === normalizedCorrect;
          const variant = isPoll
            ? "poll"
            : isCorrect
              ? "mcq-correct"
              : "mcq-default";
          const isYourAnswer =
            normalizedYourAnswer !== null &&
            row.option.toLowerCase() === normalizedYourAnswer;

          return (
            <OptionResultRow
              key={row.option}
              option={row.option}
              percent={row.percent}
              variant={variant}
              isYourAnswer={mode === "participant" && isYourAnswer}
            />
          );
        })}
      </ul>

      <p className="mt-4 text-sm text-text-secondary">
        {results.totalAnswers}{" "}
        {results.totalAnswers === 1 ? "answer" : "answers"} received
      </p>

      {mode === "participant" && normalizedYourAnswer !== null ? (
        <p
          className={`mt-2 text-sm font-medium ${
            isMcq
              ? yourWasCorrect
                ? "text-signal"
                : "text-text-secondary"
              : "text-text-secondary"
          }`}
        >
          {isMcq
            ? yourWasCorrect
              ? "You got it right!"
              : "You didn't get this one."
            : "Thanks for your vote!"}
        </p>
      ) : null}

      {mode === "participant" && normalizedYourAnswer === null ? (
        <p className="mt-2 text-sm text-text-secondary">
          You didn&apos;t answer this question.
        </p>
      ) : null}
    </section>
  );
}
