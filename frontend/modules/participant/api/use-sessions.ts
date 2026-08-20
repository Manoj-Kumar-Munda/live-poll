"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { participantSessionKeys } from "./session-keys";
import * as sessionApi from "./sessions";

export function useMySessions() {
  return useQuery({
    queryKey: participantSessionKeys.mine(),
    queryFn: () => sessionApi.listMySessions(),
  });
}

export function useParticipantSession(sessionId: string) {
  return useQuery({
    queryKey: participantSessionKeys.detail(sessionId),
    queryFn: () => sessionApi.getSession(sessionId),
  });
}

export function useJoinSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomCode: string) => sessionApi.joinSession(roomCode),
    onSuccess: (session) => {
      queryClient.setQueryData(
        participantSessionKeys.detail(session.id),
        session,
      );
      queryClient.invalidateQueries({ queryKey: participantSessionKeys.mine() });
    },
  });
}

export function useLeaveSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sessionApi.leaveSession(sessionId),
    onSuccess: (session) => {
      queryClient.setQueryData(participantSessionKeys.detail(sessionId), session);
    },
  });
}
