"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { LiveQuestion } from "@/shared/types";
import { QuestionCountdown } from "./question-countdown";

type LiveQuestionPanelProps = {
  question: LiveQuestion;
  endsAt: string;
  serverNow: string;
  index: number;
  mode?: "preview" | "answer";
  submittedValue?: string | null;
  onSubmit?: (value: string) => void;
  isSubmitting?: boolean;
};

export function LiveQuestionPanel({
  question,
  endsAt,
  serverNow,
  index,
  mode = "preview",
  submittedValue = null,
  onSubmit,
  isSubmitting = false,
}: LiveQuestionPanelProps) {
  const [openTextValue, setOpenTextValue] = useState("");
  const skewRef = useRef(Date.now() - new Date(serverNow).getTime());
  const [canAnswer, setCanAnswer] = useState(true);
  const isAnswerMode = mode === "answer";
  const hasSubmitted = submittedValue !== null;

  useEffect(() => {
    skewRef.current = Date.now() - new Date(serverNow).getTime();

    function tick() {
      const now = Date.now() - skewRef.current;
      const remainingMs = new Date(endsAt).getTime() - now;
      setCanAnswer(remainingMs > 0);
    }

    tick();
    const intervalId = setInterval(tick, 200);
    return () => clearInterval(intervalId);
  }, [endsAt, serverNow]);

  useEffect(() => {
    setOpenTextValue("");
  }, [question.id]);

  function handleOptionSelect(option: string) {
    if (!isAnswerMode || !onSubmit || hasSubmitted || isSubmitting || !canAnswer) {
      return;
    }

    onSubmit(option);
  }

  function handleOpenTextSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAnswerMode || !onSubmit || hasSubmitted || isSubmitting || !canAnswer) {
      return;
    }

    const trimmed = openTextValue.trim();
    if (!trimmed) {
      return;
    }

    onSubmit(trimmed);
  }

  const inputDisabled =
    !isAnswerMode || hasSubmitted || isSubmitting || !canAnswer;

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
          {question.options.map((option) => {
            const isSelected =
              submittedValue !== null &&
              option.toLowerCase() === submittedValue.toLowerCase();

            return (
              <li key={option}>
                {isAnswerMode ? (
                  <button
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    disabled={inputDisabled}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      isSelected
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "border-border bg-background hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    {option}
                  </button>
                ) : (
                  <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
                    {option}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      {question.type === "OPEN_TEXT" ? (
        isAnswerMode ? (
          <form className="mt-6 space-y-3" onSubmit={handleOpenTextSubmit}>
            <textarea
              value={hasSubmitted ? submittedValue ?? "" : openTextValue}
              onChange={(event) => setOpenTextValue(event.target.value)}
              maxLength={question.maxLength}
              rows={3}
              disabled={inputDisabled}
              placeholder="Type your answer..."
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
            />
            {!hasSubmitted ? (
              <Button
                type="submit"
                disabled={inputDisabled || openTextValue.trim().length === 0}
              >
                {isSubmitting ? "Submitting..." : "Submit answer"}
              </Button>
            ) : null}
          </form>
        ) : question.maxLength != null ? (
          <p className="mt-4 text-sm text-text-secondary">
            Answer up to {question.maxLength} characters
          </p>
        ) : null
      ) : null}

      {isAnswerMode && hasSubmitted ? (
        <p className="mt-4 text-sm font-medium text-primary">
          Answer recorded. Waiting for results...
        </p>
      ) : null}

      {isAnswerMode && !hasSubmitted && !canAnswer ? (
        <p className="mt-4 text-sm text-text-secondary">Time is up.</p>
      ) : null}
    </section>
  );
}
