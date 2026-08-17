import { api } from "@/lib/api";
import type { SessionDetail } from "@/shared/types";

export async function joinSession(roomCode: string) {
  const { data } = await api.post<{ session: SessionDetail }>(
    "/api/sessions/join",
    { roomCode: roomCode.trim().toUpperCase() },
  );
  return data.session;
}

export async function getSession(sessionId: string) {
  const { data } = await api.get<{ session: SessionDetail }>(
    `/api/sessions/${sessionId}`,
  );
  return data.session;
}

export async function leaveSession(sessionId: string) {
  const { data } = await api.post<{ session: SessionDetail }>(
    `/api/sessions/${sessionId}/leave`,
  );
  return data.session;
}
