import { api } from "@/lib/api";
import type { ParticipantSessionItem, SessionDetail } from "@/shared/types";

export async function listMySessions() {
  const { data } = await api.get<{ sessions: ParticipantSessionItem[] }>(
    "/api/sessions/mine",
  );
  return data.sessions;
}

export async function joinSession(roomCode: string) {
  const { data } = await api.post<{ session: SessionDetail }>(
    "/api/sessions/join",
    { roomCode: roomCode.trim().toUpperCase() },
  );
  return data.session;
}

export async function guestJoinSession(input: {
  name: string;
  email: string;
  roomCode: string;
}) {
  const { data } = await api.post<{ session: SessionDetail }>(
    "/api/sessions/guest-join",
    {
      name: input.name.trim(),
      email: input.email.trim(),
      roomCode: input.roomCode.trim().toUpperCase(),
    },
  );
  return data.session;
}

export async function guestLogout() {
  await api.post("/api/sessions/guest-logout");
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
