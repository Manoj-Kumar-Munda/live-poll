"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SessionStatusBadge } from "@/components/session-status-badge";
import { LiveQuestionPanel } from "@/components/live-question-panel";
import { LeaderboardPanel } from "@/components/leaderboard-panel";
import { QuestionResultsPanel } from "@/components/question-results-panel";
import { WordCloudPanel } from "@/components/word-cloud-panel";
import { useLiveQuestion } from "@/shared/hooks/use-live-question";
import {
  useEndSession,
  useSession,
  useStartSession,
} from "../api/use-sessions";
import { sessionKeys } from "../api/session-keys";
import { useSessionRoom } from "@/shared/hooks/use-session-room";

type SessionControlPageProps = {
  sessionId: string;
};

export function SessionControlPage({ sessionId }: SessionControlPageProps) {
  const router = useRouter();
  const { data: session, isLoading, isError } = useSession(sessionId);
  const startSession = useStartSession(sessionId);
  const endSession = useEndSession(sessionId);

  useSessionRoom(sessionId, sessionKeys.detail(sessionId));
  const {
    activeQuestion,
    lastEnded,
    questionResults,
    leaderboard,
    wordCloudTerms,
    wordCloudQuestionKey,
    launchQuestion,
    endQuestion,
    hasActiveQuestion,
    isOpenTextActive,
  } = useLiveQuestion(sessionId);

  async function handleStart() {
    try {
      await startSession.mutateAsync();
    } catch {
      // Toast handled globally.
    }
  }

  async function handleEnd() {
    try {
      await endSession.mutateAsync();
    } catch {
      // Toast handled globally.
    }
  }

  async function copyRoomCode() {
    if (!session?.roomCode) {
      return;
    }

    await navigator.clipboard.writeText(session.roomCode);
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-12 text-sm text-muted-foreground sm:px-8">
        Loading session...
      </main>
    );
  }

  if (isError || !session) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-sm text-text-secondary">Session not found.</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <Link
        href={`/dashboard/quizzes/${session.quizId}`}
        className="text-sm font-medium text-primary hover:underline"
      >
        Back to event
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {session.quizTitle}
            </h1>
            <SessionStatusBadge status={session.status} />
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {session.participantCount}{" "}
            {session.participantCount === 1 ? "player" : "players"} in the
            waiting room
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {session.status === "WAITING" ? (
            <Button
              type="button"
              onClick={handleStart}
              disabled={startSession.isPending}
            >
              {startSession.isPending ? "Starting..." : "Start event"}
            </Button>
          ) : null}
          {session.status === "WAITING" || session.status === "LIVE" ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleEnd}
              disabled={endSession.isPending}
            >
              {endSession.isPending ? "Ending..." : "End session"}
            </Button>
          ) : null}
          {session.status === "FINISHED" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/quizzes/${session.quizId}`)}
            >
              Back to event
            </Button>
          ) : null}
        </div>
      </div>

      {session.status !== "FINISHED" ? (
        <section className="mt-8 rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-medium text-text-secondary">Room code</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="font-mono text-4xl font-bold tracking-[0.3em] text-text-primary">
              {session.roomCode}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={copyRoomCode}>
              Copy code
            </Button>
          </div>
          <p className="mt-3 text-sm text-text-secondary">
            Share this code so players can join at{" "}
            <span className="font-medium">/join</span> while the room is open.
          </p>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Players</h2>
        {session.participants.length === 0 ? (
          <p className="mt-3 text-sm text-text-secondary">
            No one has joined yet. Share the room code to get started.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
            {session.participants
              .filter((participant) => participant.status === "ACTIVE")
              .map((participant) => (
                <li
                  key={participant.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="font-medium">{participant.displayName}</span>
                  <span className="text-text-secondary">
                    joined{" "}
                    {new Date(participant.joinedAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>

      {session.status === "LIVE" ? (
        <section className="mt-8 rounded-xl border border-dashed border-border p-5">
          <h2 className="font-display text-lg font-semibold">Live controls</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={launchQuestion}
              disabled={hasActiveQuestion}
            >
              Launch next question
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={endQuestion}
              disabled={!hasActiveQuestion}
            >
              End question early
            </Button>
          </div>
          {lastEnded && !activeQuestion && !questionResults ? (
            <p className="mt-3 text-sm text-text-secondary">
              Question {lastEnded.index + 1} ended (
              {lastEnded.reason === "timer" ? "time up" : "host ended"}).
              Calculating results...
            </p>
          ) : null}
        </section>
      ) : null}

      {questionResults ? (
        <QuestionResultsPanel results={questionResults} mode="host" />
      ) : null}

      {leaderboard ? (
        <LeaderboardPanel
          entries={leaderboard.entries}
          final={leaderboard.final}
        />
      ) : null}

      {activeQuestion ? (
        <LiveQuestionPanel
          question={activeQuestion.question}
          endsAt={activeQuestion.endsAt}
          serverNow={activeQuestion.serverNow}
          index={activeQuestion.index}
        />
      ) : null}

      {isOpenTextActive ? (
        <WordCloudPanel
          terms={wordCloudTerms}
          questionKey={wordCloudQuestionKey}
          mode="live"
          answerCount={wordCloudTerms.reduce(
            (total, term) => total + term.count,
            0,
          )}
        />
      ) : null}
    </main>
  );
}
