import type { SessionStatus } from "@/shared/types";

export type PublishedQuizLiveSession = {
  sessionId: string;
  status: Extract<SessionStatus, "WAITING" | "LIVE">;
  participantCount: number;
};

export type PublishedQuiz = {
  id: string;
  title: string;
  description: string | null;
  questionCount: number;
  timeLimitSeconds: number;
  pointsPerQuestion: number;
  hostName: string;
  updatedAt: string;
  liveSession: PublishedQuizLiveSession;
};

export type PublishedQuizStatusFilter = PublishedQuizLiveSession["status"];
