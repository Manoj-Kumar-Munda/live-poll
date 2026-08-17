"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { participantSessionKeys } from "./session-keys";
import * as sessionApi from "./sessions";

export function useParticipantSession(sessionId: string) {
  return useQuery({
    queryKey: participantSessionKeys.detail(sessionId),
    queryFn: () => sessionApi.getSession(sessionId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "WAITING" || status === "LIVE" ? 3000 : false;
    },
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
