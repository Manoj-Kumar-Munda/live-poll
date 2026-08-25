"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SessionStatusBadge } from "@/components/session-status-badge";
import { LiveQuestionPanel } from "@/components/live-question-panel";
import { QuestionResultsPanel } from "@/components/question-results-panel";
import { useLiveQuestion } from "@/shared/hooks/use-live-question";
import {
  useLeaveSession,
  useParticipantSession,
} from "../api/use-sessions";
import { participantSessionKeys } from "../api/session-keys";
import { useSessionRoom } from "@/shared/hooks/use-session-room";

type SessionPageProps = {
  sessionId: string;
};

export function SessionPage({ sessionId }: SessionPageProps) {
  const router = useRouter();
  const { data: session, isLoading, isError } = useParticipantSession(sessionId);
  const leaveSession = useLeaveSession(sessionId);

  useSessionRoom(sessionId, participantSessionKeys.detail(sessionId));
  const {
    activeQuestion,
    lastEnded,
    questionResults,
    submittedAnswer,
    isSubmitting,
    submitAnswer,
  } = useLiveQuestion(sessionId);

  async function handleLeave() {
    try {
      await leaveSession.mutateAsync();
      router.push("/home");
    } catch {
      // Toast handled globally.
    }
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
          href="/home"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {session.quizTitle}
            </h1>
            <SessionStatusBadge status={session.status} />
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Room code{" "}
            <span className="font-mono font-semibold">{session.roomCode}</span>
          </p>
        </div>

        {session.status !== "FINISHED" ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleLeave}
            disabled={leaveSession.isPending}
          >
            {leaveSession.isPending ? "Leaving..." : "Leave session"}
          </Button>
        ) : null}
      </div>

      {session.status === "WAITING" ? (
        <section className="mt-10 rounded-xl border border-border bg-surface p-8 text-center">
          <p className="font-display text-xl font-semibold">Waiting for host</p>
          <p className="mt-2 text-sm text-text-secondary">
            {session.participantCount}{" "}
            {session.participantCount === 1 ? "player" : "players"} in the
            room. The quiz starts when the host is ready.
          </p>
        </section>
      ) : null}

      {session.status === "LIVE" && !activeQuestion && !questionResults ? (
        <section className="mt-10 rounded-xl border border-border bg-surface p-8 text-center">
          <p className="font-display text-xl font-semibold">
            {lastEnded ? "Waiting for the next question" : "Quiz in progress"}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            {lastEnded
              ? `Question ${lastEnded.index + 1} has ended. Hang tight.`
              : "The host will launch the first question soon."}
          </p>
        </section>
      ) : null}

      {questionResults ? (
        <QuestionResultsPanel
          results={questionResults}
          mode="participant"
          yourAnswer={submittedAnswer}
        />
      ) : null}

      {activeQuestion ? (
        <LiveQuestionPanel
          question={activeQuestion.question}
          endsAt={activeQuestion.endsAt}
          serverNow={activeQuestion.serverNow}
          index={activeQuestion.index}
          mode="answer"
          submittedValue={submittedAnswer}
          onSubmit={submitAnswer}
          isSubmitting={isSubmitting}
        />
      ) : null}

      {session.status === "FINISHED" ? (
        <section className="mt-10 rounded-xl border border-border bg-surface p-8 text-center">
          <p className="font-display text-xl font-semibold">Session ended</p>
          <p className="mt-2 text-sm text-text-secondary">
            You answered {session.myQuestionsAnswered ?? 0}{" "}
            {(session.myQuestionsAnswered ?? 0) === 1 ? "question" : "questions"}.
            Thanks for playing.
          </p>
          <Link
            href="/home"
            className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Back to home
          </Link>
        </section>
      ) : null}
    </main>
  );
}
