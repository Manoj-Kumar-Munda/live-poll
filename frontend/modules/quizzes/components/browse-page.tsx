"use client";

import { Suspense, useState } from "react";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionStatusBadge } from "@/components/session-status-badge";
import { SectionIntro } from "@/components/marketing/section-intro";
import { LandingNav } from "@/modules/landing/components/nav";
import { LandingFooter } from "@/modules/landing/components/footer";
import type { PublishedQuiz, PublishedQuizStatusFilter } from "../types";
import { usePublishedQuizzes } from "../api/use-published-quizzes";

const FILTERS: { label: string; value?: PublishedQuizStatusFilter }[] = [
  { label: "All" },
  { label: "Join now", value: "WAITING" },
  { label: "In progress", value: "LIVE" },
];

function getCardHelperText(quiz: PublishedQuiz) {
  if (quiz.liveSession.status === "WAITING") {
    return "Open for new players — enter your room code below";
  }

  return "Session already started — you can still watch if your host allows it";
}

export function QuizzesBrowsePage() {
  const [status, setStatus] = useState<PublishedQuizStatusFilter | undefined>();
  const { data: quizzes = [], isLoading } = usePublishedQuizzes(status);

  return (
    <>
      <LandingNav />
      <main>
        <section className="marketing-band border-b border-border/60 pt-24 pb-10 sm:pt-28 sm:pb-12">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <SectionIntro
              eyebrow="Open sessions"
              title="Browse quizzes happening now"
              description="See what is live or waiting for players. Your host shares the room code — use it below to join before the event starts."
            />
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div
            className="inline-flex rounded-full border border-border bg-surface p-1"
            role="tablist"
            aria-label="Filter quizzes"
          >
            {FILTERS.map((filter) => {
              const active = status === filter.value;

              return (
                <button
                  key={filter.label}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatus(filter.value)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <p className="mt-8 text-sm text-muted-foreground">Loading sessions...</p>
          ) : quizzes.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface px-5 py-14 text-center">
              <p className="font-medium text-text-primary">
                No open quizzes right now
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Check back when a host starts a session, or join directly with a
                room code below.
              </p>
            </div>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {quizzes.map((quiz) => (
                <li key={quiz.id}>
                  <article
                    className={cn(
                      "card-hover h-full rounded-2xl border p-5 transition-colors",
                      quiz.liveSession.status === "WAITING"
                        ? "border-primary/20 bg-primary/3"
                        : "border-border bg-surface",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-display text-lg font-semibold text-text-primary">
                        {quiz.title}
                      </h2>
                      <SessionStatusBadge status={quiz.liveSession.status} />
                    </div>

                    {quiz.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                        {quiz.description}
                      </p>
                    ) : null}

                    <p className="mt-4 text-sm text-text-secondary">
                      Hosted by {quiz.hostName}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
                      <span>
                        {quiz.questionCount}{" "}
                        {quiz.questionCount === 1 ? "question" : "questions"}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{quiz.timeLimitSeconds}s per question</span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={14} aria-hidden className="text-primary" />
                        {quiz.liveSession.participantCount}{" "}
                        {quiz.liveSession.participantCount === 1
                          ? "player"
                          : "players"}
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">
                      {getCardHelperText(quiz)}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
