import { api } from "@/lib/api";
import type {
  HostDashboardStats,
  Session,
  SessionDetail,
  SessionStatus,
} from "@/shared/types";

export async function getHostDashboardStats() {
  const { data } = await api.get<{ stats: HostDashboardStats }>(
    "/api/sessions/stats",
  );
  return data.stats;
}

export async function listSessions(filters?: {
  quizId?: string;
  status?: SessionStatus;
}) {
  const { data } = await api.get<{ sessions: Session[] }>(
    "/api/sessions",
    { params: filters },
  );
  return data.sessions;
}

export async function createSession(quizId: string) {
  const { data } = await api.post<{ session: SessionDetail }>("/api/sessions", {
    quizId,
  });
  return data.session;
}

export async function getSession(sessionId: string) {
  const { data } = await api.get<{ session: SessionDetail }>(
    `/api/sessions/${sessionId}`,
  );
  return data.session;
}

export async function startSession(sessionId: string) {
  const { data } = await api.post<{ session: SessionDetail }>(
    `/api/sessions/${sessionId}/start`,
  );
  return data.session;
}

export async function endSession(sessionId: string) {
  const { data } = await api.post<{ session: SessionDetail }>(
    `/api/sessions/${sessionId}/end`,
  );
  return data.session;
}
