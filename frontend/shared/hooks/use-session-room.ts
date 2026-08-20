"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showErrorToast } from "@/lib/errors";
import { connectSocket, getSocket } from "@/lib/socket";
import type { SessionDetail, SessionRoomState } from "@/shared/types";

function mergeSessionState(
  current: SessionDetail | undefined,
  state: SessionRoomState,
  role?: SessionDetail["role"],
): SessionDetail {
  return {
    ...state,
    role: role ?? current?.role ?? "participant",
  };
}

export function useSessionRoom(
  sessionId: string | undefined,
  queryKey: readonly unknown[],
) {
  const queryClient = useQueryClient();
  const queryKeyRef = useRef(queryKey);
  queryKeyRef.current = queryKey;

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const socket = connectSocket();

    function onJoined(payload: {
      role: SessionDetail["role"];
      state: SessionRoomState;
    }) {
      queryClient.setQueryData<SessionDetail>(queryKeyRef.current, () =>
        mergeSessionState(undefined, payload.state, payload.role),
      );
    }

    function onState(state: SessionRoomState) {
      queryClient.setQueryData<SessionDetail>(queryKeyRef.current, (current) =>
        current ? mergeSessionState(current, state) : undefined,
      );
    }

    function onError(payload: { message: string }) {
      showErrorToast(new Error(payload.message));
    }

    socket.on("session:joined", onJoined);
    socket.on("session:state", onState);
    socket.on("session:error", onError);
    socket.emit("session:join", { sessionId });

    return () => {
      socket.emit("session:leave");
      socket.off("session:joined", onJoined);
      socket.off("session:state", onState);
      socket.off("session:error", onError);
    };
  }, [queryClient, sessionId]);
}
