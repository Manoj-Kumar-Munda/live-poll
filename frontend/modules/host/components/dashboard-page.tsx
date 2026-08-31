"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionStatusBadge } from "@/components/session-status-badge";
import type { Session } from "@/shared/types";
import { useHostDashboardStats, useSessions } from "../api/use-sessions";

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useHostDashboardStats();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();

  const activeSessions = sessions.filter(
    (session) => session.status === "WAITING" || session.status === "LIVE",
  );

  const recentHostedEvents = sessions
    .filter((session) => session.status === "FINISHED")
    .sort(
      (a, b) =>
        new Date(b.finishedAt ?? b.updatedAt).getTime() -
        new Date(a.finishedAt ?? a.updatedAt).getTime(),
    )
    .slice(0, 5);

  const isLoading = statsLoading || sessionsLoading;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Host</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-text-primary">
            Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
            Launch live events, share room codes, and control questions in real
            time.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/dashboard/quizzes" />}
          className="rounded-full"
        >
          Manage events
        </Button>
      </div>

      {statsLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading...</p>
      ) : (
        <dl className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat label="Total events hosted" value={stats?.totalEventsHosted ?? 0} />
          <Stat label="Total participants" value={stats?.totalParticipants ?? 0} />
          <Stat
            label="Avg. per event"
            value={stats?.avgParticipantsPerEvent ?? 0}
          />
        </dl>
      )}

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Live event</h2>
        {sessionsLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
        ) : activeSessions.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {activeSessions.map((session) => (
              <li
                key={session.id}
                className="rounded-xl border border-primary/25 bg-primary/5 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-text-primary">
                        {session.quizTitle}
                      </p>
                      <SessionStatusBadge status={session.status} />
                    </div>
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
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-surface px-5 py-8 text-center">
            <p className="font-medium text-text-primary">No live event running</p>
            <p className="mt-1 text-sm text-text-secondary">
              Start a session from a published event when you&apos;re ready to go
              live. It will show up here.
            </p>
            <Button
              className="mt-4"
              nativeButton={false}
              render={<Link href="/dashboard/quizzes" />}
            >
              Go to events
            </Button>
          </div>
        )}
      </section>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading...</p>
      ) : (
        <section className="mt-10">
            <h2 className="font-display text-lg font-semibold">
              Recent hosted events
            </h2>
            {recentHostedEvents.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border px-5 py-10 text-center">
                <p className="font-medium text-text-primary">
                  No hosted events yet
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  When you finish a live session, it will appear here with the
                  date you hosted it.
                </p>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-border rounded-xl overflow-hidden border border-border bg-surface">
                {recentHostedEvents.map((session) => (
                  <li key={session.id}>
                    <Link
                      href={`/dashboard/quizzes/${session.quizId}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-raised"
                    >
                      <div>
                        <p className="font-medium text-text-primary">
                          {session.quizTitle}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {session.participantCount}{" "}
                          {session.participantCount === 1
                            ? "player"
                            : "players"}
                        </p>
                      </div>
                      <time
                        dateTime={getHostedDateIso(session)}
                        className="shrink-0 text-sm text-text-secondary"
                      >
                        {formatHostedDate(session)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-4">
      <dt className="text-sm text-text-secondary">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-bold tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function getHostedDateIso(session: Session) {
  return session.liveStartedAt ?? session.finishedAt ?? session.createdAt;
}

function formatHostedDate(session: Session) {
  const date = new Date(getHostedDateIso(session));

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
