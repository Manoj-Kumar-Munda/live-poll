"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SessionStatus } from "@/shared/types";
import { sessionKeys } from "./session-keys";
import * as sessionApi from "./sessions";

export function useSessions(filters?: {
  quizId?: string;
  status?: SessionStatus;
}) {
  return useQuery({
    queryKey: sessionKeys.list(filters),
    queryFn: () => sessionApi.listSessions(filters),
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: () => sessionApi.getSession(sessionId),
  });
}

function useInvalidateSessions() {
  const queryClient = useQueryClient();

  return (sessionId?: string) => {
    queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    if (sessionId) {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
    }
  };
}

export function useCreateSession() {
  const invalidate = useInvalidateSessions();

  return useMutation({
    mutationFn: (quizId: string) => sessionApi.createSession(quizId),
    onSuccess: (session) => invalidate(session.id),
  });
}

export function useStartSession(sessionId: string) {
  const invalidate = useInvalidateSessions();

  return useMutation({
    mutationFn: () => sessionApi.startSession(sessionId),
    onSuccess: () => invalidate(sessionId),
  });
}

export function useEndSession(sessionId: string) {
  const invalidate = useInvalidateSessions();

  return useMutation({
    mutationFn: () => sessionApi.endSession(sessionId),
    onSuccess: () => invalidate(sessionId),
  });
}
