"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuizzes } from "../api/use-quizzes";
import type { QuizStatus } from "../types";
import { StatusBadge } from "./status-badge";

const FILTERS: { label: string; value?: QuizStatus }[] = [
  { label: "All" },
  { label: "Drafts", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
];

export function QuizListPage() {
  const [status, setStatus] = useState<QuizStatus | undefined>();

  const { data: quizzes = [], isLoading } = useQuizzes(status);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Events
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Create a draft, add questions, then publish.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/quizzes/new" />}>
          New event
        </Button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter.label}
            type="button"
            size="sm"
            variant={status === filter.value ? "default" : "outline"}
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading...</p>
      ) : quizzes.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border px-5 py-10 text-center">
          <p className="text-sm text-text-secondary">No events in this filter.</p>
          <Button
            className="mt-4"
            nativeButton={false}
            render={<Link href="/dashboard/quizzes/new" />}
          >
            Create an event
          </Button>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              <Link
                href={`/dashboard/quizzes/${quiz.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-raised"
              >
                <div>
                  <p className="font-medium">{quiz.title}</p>
                  <p className="text-sm text-text-secondary">
                    {quiz.questionCount}{" "}
                    {quiz.questionCount === 1 ? "question" : "questions"} ·{" "}
                    {quiz.timeLimitSeconds}s
                  </p>
                </div>
                <StatusBadge status={quiz.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
