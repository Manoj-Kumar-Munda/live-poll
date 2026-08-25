"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionStatusBadge } from "@/components/session-status-badge";
import { useQuizzes } from "../api/use-quizzes";
import { useSessions } from "../api/use-sessions";
import { StatusBadge } from "./status-badge";

export function DashboardPage() {
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuizzes();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();

  const activeSessions = sessions.filter(
    (session) => session.status === "WAITING" || session.status === "LIVE",
  );

  const drafts = quizzes.filter((quiz) => quiz.status === "DRAFT").length;
  const published = quizzes.filter((quiz) => quiz.status === "PUBLISHED").length;
  const recent = quizzes.slice(0, 5);
  const isLoading = quizzesLoading || sessionsLoading;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Host</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary">
            Tonight&apos;s set list
          </h1>
          <p className="mt-2 max-w-xl text-sm text-text-secondary">
            Draft a quiz, publish when you&apos;re ready, then run a live session
            from the control room.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/quizzes" />}>
          Manage quizzes
        </Button>
      </div>

      {sessionsLoading ? null : activeSessions.length > 0 ? (
        <section className="mt-8 space-y-3">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-xl border border-primary/25 bg-primary/5 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">
                      {session.status === "LIVE"
                        ? "Live session in progress"
                        : "Waiting room open"}
                    </h2>
                    <SessionStatusBadge status={session.status} />
                  </div>
                  <p className="mt-1 font-medium text-text-primary">
                    {session.quizTitle}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Room code{" "}
                    <span className="font-mono font-semibold">
                      {session.roomCode}
                    </span>
                    {" · "}
                    {session.participantCount}{" "}
                    {session.participantCount === 1 ? "player" : "players"}
                  </p>
                </div>
                <Button
                  nativeButton={false}
                  render={
                    <Link href={`/dashboard/sessions/${session.id}`} />
                  }
                >
                  {session.status === "LIVE"
                    ? "Return to control room"
                    : "Open control room"}
                </Button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading quizzes...</p>
      ) : (
        <>
          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="Total quizzes" value={quizzes.length} />
            <Stat label="Drafts" value={drafts} />
            <Stat label="Published" value={published} />
          </dl>

          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Recent</h2>
              <Link
                href="/dashboard/quizzes"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
                <p className="font-medium text-text-primary">No quizzes yet</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Create your first quiz and add a couple of questions.
                </p>
                <Button
                  className="mt-4"
                  nativeButton={false}
                  render={<Link href="/dashboard/quizzes/new" />}
                >
                  Create a quiz
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
                {recent.map((quiz) => (
                  <li key={quiz.id}>
                    <Link
                      href={`/dashboard/quizzes/${quiz.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-raised"
                    >
                      <div>
                        <p className="font-medium text-text-primary">
                          {quiz.title}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {quiz.questionCount}{" "}
                          {quiz.questionCount === 1 ? "question" : "questions"}
                        </p>
                      </div>
                      <StatusBadge status={quiz.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-4">
      <dt className="text-sm text-text-secondary">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-bold tabular-nums">
        {value}
      </dd>
    </div>
  );
}
