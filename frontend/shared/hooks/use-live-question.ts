"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { connectSocket, getSocket } from "@/lib/socket";
import type {
  LeaderboardUpdatedPayload,
  QuestionEndedPayload,
  QuestionResultsPayload,
  QuestionStartedPayload,
  WordCloudSnapshotPayload,
  WordCloudTerm,
  WordCloudUpdatedPayload,
} from "@/shared/types";

function sortWordCloudTerms(terms: WordCloudTerm[]) {
  return [...terms].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.label.localeCompare(right.label);
  });
}

function applyWordCloudUpdate(
  terms: WordCloudTerm[],
  payload: WordCloudUpdatedPayload,
): WordCloudTerm[] {
  const next = new Map(terms.map((term) => [term.key, term]));
  next.set(payload.term.key, payload.term);
  return sortWordCloudTerms([...next.values()]);
}

export function useLiveQuestion(sessionId: string | undefined) {
  const [activeQuestion, setActiveQuestion] =
    useState<QuestionStartedPayload | null>(null);
  const [lastEnded, setLastEnded] = useState<QuestionEndedPayload | null>(null);
  const [questionResults, setQuestionResults] =
    useState<QuestionResultsPayload | null>(null);
  const [leaderboard, setLeaderboard] =
    useState<LeaderboardUpdatedPayload | null>(null);
  const [wordCloudTerms, setWordCloudTerms] = useState<WordCloudTerm[]>([]);
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activeQuestionRef = useRef<QuestionStartedPayload | null>(null);
  const submittedAnswerRef = useRef<string | null>(null);
  const isSubmittingRef = useRef(false);
  activeQuestionRef.current = activeQuestion;
  submittedAnswerRef.current = submittedAnswer;
  isSubmittingRef.current = isSubmitting;

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const socket = connectSocket();

    function onStarted(payload: QuestionStartedPayload) {
      if (payload.sessionId !== sessionId) {
        return;
      }

      const current = activeQuestionRef.current;
      const isSameQuestion =
        current?.index === payload.index &&
        current?.question.id === payload.question.id;

      setActiveQuestion(payload);
      setLastEnded(null);
      setQuestionResults(null);
      setLeaderboard(null);

      if (!isSameQuestion) {
        setWordCloudTerms([]);
        submittedAnswerRef.current = null;
        isSubmittingRef.current = false;
        setSubmittedAnswer(null);
        setIsSubmitting(false);
      }
    }

    function onEnded(payload: QuestionEndedPayload) {
      if (payload.sessionId !== sessionId) {
        return;
      }

      setActiveQuestion(null);
      setLastEnded(payload);
      setIsSubmitting(false);
    }

    function onAnswered(payload: { sessionId: string; value: string }) {
      if (payload.sessionId !== sessionId) {
        return;
      }

      submittedAnswerRef.current = payload.value;
      isSubmittingRef.current = false;
      setSubmittedAnswer(payload.value);
      setIsSubmitting(false);
    }

    function onResults(payload: QuestionResultsPayload) {
      if (payload.sessionId !== sessionId) {
        return;
      }

      setQuestionResults(payload);
      if (payload.wordResults) {
        setWordCloudTerms(
          payload.wordResults.map((term) => ({
            key: term.key,
            label: term.label,
            count: term.count,
          })),
        );
      }
    }

    function onLeaderboard(payload: LeaderboardUpdatedPayload) {
      if (payload.sessionId !== sessionId) {
        return;
      }

      setLeaderboard(payload);
    }

    function onWordCloudUpdated(payload: WordCloudUpdatedPayload) {
      if (payload.sessionId !== sessionId) {
        return;
      }

      setWordCloudTerms((current) => applyWordCloudUpdate(current, payload));
    }

    function onWordCloudSnapshot(payload: WordCloudSnapshotPayload) {
      if (payload.sessionId !== sessionId) {
        return;
      }

      setWordCloudTerms(sortWordCloudTerms(payload.terms));
    }

    function onError() {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }

    socket.on("question:started", onStarted);
    socket.on("question:ended", onEnded);
    socket.on("question:answered", onAnswered);
    socket.on("question:results", onResults);
    socket.on("leaderboard:updated", onLeaderboard);
    socket.on("wordcloud:updated", onWordCloudUpdated);
    socket.on("wordcloud:snapshot", onWordCloudSnapshot);
    socket.on("session:error", onError);

    return () => {
      socket.off("question:started", onStarted);
      socket.off("question:ended", onEnded);
      socket.off("question:answered", onAnswered);
      socket.off("question:results", onResults);
      socket.off("leaderboard:updated", onLeaderboard);
      socket.off("wordcloud:updated", onWordCloudUpdated);
      socket.off("wordcloud:snapshot", onWordCloudSnapshot);
      socket.off("session:error", onError);
    };
  }, [sessionId]);

  const launchQuestion = useCallback(() => {
    getSocket().emit("question:launch");
  }, []);

  const endQuestion = useCallback(() => {
    getSocket().emit("question:end");
  }, []);

  const submitAnswer = useCallback((value: string) => {
    if (submittedAnswerRef.current !== null || isSubmittingRef.current) {
      return;
    }

    const trimmed = value.trim();
    if (!trimmed || !sessionId) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    connectSocket().emit("question:answer", {
      value: trimmed,
      sessionId,
    });
  }, [sessionId]);

  const isOpenTextActive =
    activeQuestion?.question.type === "OPEN_TEXT" ? activeQuestion : null;

  const wordCloudQuestionKey = isOpenTextActive
    ? `${sessionId}-${isOpenTextActive.index}`
    : questionResults?.question.type === "OPEN_TEXT"
      ? `${sessionId}-${questionResults.index}-results`
      : "idle";

  const highlightedWordKey = submittedAnswer?.trim().toLowerCase() ?? null;

  return {
    activeQuestion,
    lastEnded,
    questionResults,
    leaderboard,
    wordCloudTerms,
    wordCloudQuestionKey,
    highlightedWordKey,
    submittedAnswer,
    isSubmitting,
    launchQuestion,
    endQuestion,
    submitAnswer,
    hasActiveQuestion: activeQuestion !== null,
    hasSubmittedAnswer: submittedAnswer !== null,
    isOpenTextActive,
  };
}
