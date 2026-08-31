"use client";

import Link from "next/link";
import { History, Medal, MessageCircleQuestion, Users } from "lucide-react";
import { SessionStatusBadge } from "@/components/session-status-badge";
import { useMySessions, useParticipantHomeStats } from "../api/use-sessions";
import { JoinSessionForm } from "./join-session-form";
import { ParticipantShell } from "./participant-shell";

function formatQuestionsAnswered(count: number) {
  return `${count} ${count === 1 ? "question" : "questions"} answered`;
}

function formatPlayedSummary(session: {
  questionsAnswered: number;
  score: number;
  rank: number | null;
  finishedAt: string | null;
  participantStatus: string;
}) {
  const parts = [formatQuestionsAnswered(session.questionsAnswered)];

  if (session.score > 0) {
    parts.push(`${session.score} pts`);
  }

  if (session.rank != null) {
    parts.push(`Rank #${session.rank}`);
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
  const { data: stats, isLoading: statsLoading } = useParticipantHomeStats();

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
    <ParticipantShell>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div>
          <p className="text-sm font-semibold text-primary">Your home</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-text-primary">
            Jump back in or join something new
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
            Enter a room code from your host, or return to a session you are
            already in.
          </p>
        </div>

        {statsLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading stats...</p>
        ) : (
          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat
              icon={Users}
              label="Quizzes played"
              value={stats?.totalQuizzesPlayed ?? 0}
            />
            <Stat
              icon={Medal}
              label="Best rank"
              value={stats?.bestRank != null ? `#${stats.bestRank}` : "—"}
            />
            <Stat
              icon={MessageCircleQuestion}
              label="Questions answered"
              value={stats?.totalQuestionsAnswered ?? 0}
            />
          </dl>
        )}

        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Your sessions
          </h2>
          {isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
          ) : activeSessions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface px-5 py-10 text-center">
              <p className="font-medium text-text-primary">No active sessions</p>
              <p className="mt-1 text-sm text-text-secondary">
                Join one with a room code above, or browse open quizzes.
              </p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {activeSessions.map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/session/${session.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-raised"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {session.quizTitle}
                      </p>
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
            <div className="flex items-center gap-2">
              <History size={18} className="text-primary" aria-hidden />
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Past sessions
              </h2>
            </div>
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {pastSessions.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-text-primary">
                      {session.quizTitle}
                    </p>
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
      </div>
    </ParticipantShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon size={18} aria-hidden />
      </div>
      <dt className="text-sm text-text-secondary">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-bold tabular-nums text-text-primary">
        {value}
      </dd>
    </div>
  );
}
