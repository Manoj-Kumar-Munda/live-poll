"use client";

import { useCallback, useEffect, useState } from "react";
import { connectSocket, getSocket } from "@/lib/socket";
import type { QuestionEndedPayload, QuestionStartedPayload } from "@/shared/types";

export function useLiveQuestion(sessionId: string | undefined) {
  const [activeQuestion, setActiveQuestion] =
    useState<QuestionStartedPayload | null>(null);
  const [lastEnded, setLastEnded] = useState<QuestionEndedPayload | null>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const socket = connectSocket();

    function onStarted(payload: QuestionStartedPayload) {
      if (payload.sessionId !== sessionId) {
        return;
      }

      setActiveQuestion(payload);
      setLastEnded(null);
    }

    function onEnded(payload: QuestionEndedPayload) {
      if (payload.sessionId !== sessionId) {
        return;
      }

      setActiveQuestion(null);
      setLastEnded(payload);
    }

    socket.on("question:started", onStarted);
    socket.on("question:ended", onEnded);

    return () => {
      socket.off("question:started", onStarted);
      socket.off("question:ended", onEnded);
    };
  }, [sessionId]);

  const launchQuestion = useCallback(() => {
    getSocket().emit("question:launch");
  }, []);

  const endQuestion = useCallback(() => {
    getSocket().emit("question:end");
  }, []);

  return {
    activeQuestion,
    lastEnded,
    launchQuestion,
    endQuestion,
    hasActiveQuestion: activeQuestion !== null,
  };
}
