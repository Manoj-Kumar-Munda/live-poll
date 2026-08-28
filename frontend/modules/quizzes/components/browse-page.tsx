"use client";

import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { SessionStatusBadge } from "@/components/session-status-badge";
import { LandingNav } from "@/modules/landing/components/nav";
import { LandingFooter } from "@/modules/landing/components/footer";
import { JoinForm } from "@/modules/participant/components/join-form";
import type { PublishedQuiz, PublishedQuizStatusFilter } from "../types";
import { usePublishedQuizzes } from "../api/use-published-quizzes";

const FILTERS: { label: string; value?: PublishedQuizStatusFilter }[] = [
  { label: "All" },
  { label: "Join now", value: "WAITING" },
  { label: "In progress", value: "LIVE" },
];

function getCardHelperText(quiz: PublishedQuiz) {
  if (quiz.liveSession.status === "WAITING") {
    return "Enter your room code below to join";
  }

  return "This session has already started";
}

export function QuizzesBrowsePage() {
  const [status, setStatus] = useState<PublishedQuizStatusFilter | undefined>();
  const { data: quizzes = [], isLoading } = usePublishedQuizzes(status);

  return (
    <>
      <LandingNav />
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-24 sm:px-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary">
            Browse quizzes
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Open sessions you can join right now. Enter a room code from your
            host to get in before the event starts.
          </p>
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
          <p className="mt-8 text-sm text-muted-foreground">Loading...</p>
        ) : quizzes.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border px-5 py-12 text-center">
            <p className="text-sm text-text-secondary">
              No quizzes are open right now. Check back when a host starts a
              session.
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {quizzes.map((quiz) => (
              <li key={quiz.id}>
                <article
                  className={
                    quiz.liveSession.status === "WAITING"
                      ? "h-full rounded-xl border border-primary/25 bg-primary/5 p-5"
                      : "h-full rounded-xl border border-border bg-surface p-5 opacity-90"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg font-semibold text-text-primary">
                      {quiz.title}
                    </h2>
                    <SessionStatusBadge status={quiz.liveSession.status} />
                  </div>

                  {quiz.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                      {quiz.description}
                    </p>
                  ) : null}

                  <p className="mt-3 text-sm text-text-secondary">
                    Hosted by {quiz.hostName}
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    {quiz.questionCount}{" "}
                    {quiz.questionCount === 1 ? "question" : "questions"} ·{" "}
                    {quiz.timeLimitSeconds}s · {quiz.liveSession.participantCount}{" "}
                    {quiz.liveSession.participantCount === 1
                      ? "player"
                      : "players"}
                  </p>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {getCardHelperText(quiz)}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}

        <section className="mt-12 rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Join with room code</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Have a code from your host? Enter your details and room code below.
            Only sessions marked Join now accept new players.
          </p>
          <Suspense
            fallback={
              <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
            }
          >
            <JoinForm className="mt-4 max-w-md" />
          </Suspense>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
