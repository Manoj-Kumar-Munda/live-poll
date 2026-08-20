import type { ParticipantStatus } from "@/types/quiz.types.js";
import type { QuestionType } from "@/types/quiz.types.js";
import type { SessionStatus } from "@/types/session.types.js";

export type SessionParticipantResponse = {
  id: string;
  userId: string;
  displayName: string;
  status: ParticipantStatus;
  score: number;
  joinedAt: string;
};

export type SessionResponse = {
  id: string;
  quizId: string;
  quizTitle: string;
  hostId: string;
  roomCode: string;
  status: SessionStatus;
  participantCount: number;
  currentQuestionIndex: number;
  questionEndsAt: string | null;
  expiresAt: string;
  liveStartedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SessionDetailResponse = SessionResponse & {
  role: "host" | "participant";
  participants: SessionParticipantResponse[];
};

/** Broadcast to everyone in a session socket room (no per-user role). */
export type SessionRoomState = SessionResponse & {
  participants: SessionParticipantResponse[];
};

export type LiveQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  order: number;
  options?: string[];
  maxLength?: number;
};

export type QuestionStartedPayload = {
  sessionId: string;
  index: number;
  question: LiveQuestion;
  endsAt: string;
  // serverNow is the server's current time when the question starts, sent alongside endsAt.
  serverNow: string;
};

export type QuestionEndedPayload = {
  sessionId: string;
  index: number;
  reason: "timer" | "host";
};
