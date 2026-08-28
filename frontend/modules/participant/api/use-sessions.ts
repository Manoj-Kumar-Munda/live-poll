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

export function useParticipantHomeStats() {
  return useQuery({
    queryKey: participantSessionKeys.stats(),
    queryFn: () => sessionApi.getParticipantHomeStats(),
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
      queryClient.invalidateQueries({ queryKey: participantSessionKeys.stats() });
    },
  });
}

export function useGuestJoinSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      name: string;
      email: string;
      roomCode: string;
    }) => sessionApi.guestJoinSession(input),
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
