"use client";

import Link from "next/link";
import { SessionStatusBadge } from "@/components/session-status-badge";
import { useMySessions } from "../api/use-sessions";
import { JoinSessionForm } from "./join-session-form";

function formatQuestionsAnswered(count: number) {
  return `${count} ${count === 1 ? "question" : "questions"} answered`;
}

function formatPlayedSummary(session: {
  questionsAnswered: number;
  score: number;
  finishedAt: string | null;
  participantStatus: string;
}) {
  const parts = [formatQuestionsAnswered(session.questionsAnswered)];

  if (session.score > 0) {
    parts.push(`${session.score} pts`);
  }

  if (session.finishedAt) {
    parts.push(new Date(session.finishedAt).toLocaleDateString());
  }

  if (session.participantStatus === "QUIT") {
    parts.push("Left early");
  }

  return parts.join(" · ");
}

export function ParticipantHomePage() {
  const { data: sessions = [], isLoading } = useMySessions();

  const activeSessions = sessions.filter(
    (session) =>
      session.participantStatus === "ACTIVE" &&
      (session.status === "WAITING" || session.status === "LIVE"),
  );
  const pastSessions = sessions.filter(
    (session) =>
      session.status === "FINISHED" ||
      session.participantStatus === "FINISHED" ||
      session.participantStatus === "QUIT",
  );

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Home</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Join a room code or jump back into a session you&apos;re already in.
        </p>
      </div>

      <section className="mt-8 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-lg font-semibold">Quick join</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Enter the 6-character code from your host.
        </p>
        <JoinSessionForm className="mt-4 max-w-sm" />
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Your sessions</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
        ) : activeSessions.length === 0 ? (
          <p className="mt-3 text-sm text-text-secondary">
            No active sessions. Join one with a room code above.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
            {activeSessions.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/session/${session.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-raised"
                >
                  <div>
                    <p className="font-medium">{session.quizTitle}</p>
                    <p className="text-sm text-text-secondary">
                      Room {session.roomCode} · {session.participantCount}{" "}
                      {session.participantCount === 1 ? "player" : "players"}
                      {session.questionsAnswered > 0
                        ? ` · ${formatQuestionsAnswered(session.questionsAnswered)}`
                        : null}
                    </p>
                  </div>
                  <SessionStatusBadge status={session.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pastSessions.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold">Past sessions</h2>
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
            {pastSessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="font-medium">{session.quizTitle}</p>
                  <p className="text-sm text-text-secondary">
                    {formatPlayedSummary(session)}
                  </p>
                </div>
                <SessionStatusBadge status={session.status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
