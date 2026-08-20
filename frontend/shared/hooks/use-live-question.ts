"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { connectSocket, getSocket } from "@/lib/socket";
import type { QuestionEndedPayload, QuestionStartedPayload } from "@/shared/types";

export function useLiveQuestion(sessionId: string | undefined) {
  const [activeQuestion, setActiveQuestion] =
    useState<QuestionStartedPayload | null>(null);
  const [lastEnded, setLastEnded] = useState<QuestionEndedPayload | null>(null);
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

      if (!isSameQuestion) {
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

    function onError() {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }

    socket.on("question:started", onStarted);
    socket.on("question:ended", onEnded);
    socket.on("question:answered", onAnswered);
    socket.on("session:error", onError);

    return () => {
      socket.off("question:started", onStarted);
      socket.off("question:ended", onEnded);
      socket.off("question:answered", onAnswered);
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

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    getSocket().emit("question:answer", { value });
  }, []);

  return {
    activeQuestion,
    lastEnded,
    submittedAnswer,
    isSubmitting,
    launchQuestion,
    endQuestion,
    submitAnswer,
    hasActiveQuestion: activeQuestion !== null,
    hasSubmittedAnswer: submittedAnswer !== null,
  };
}
