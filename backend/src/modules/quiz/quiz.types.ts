import type { QuestionType, QuizStatus } from "@/types/quiz.types.js";

/** API response shape for quiz list / create / update. */
export type QuizResponse = {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  status: QuizStatus;
  pointsPerQuestion: number;
  timeLimitSeconds: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type QuestionResponse = {
  id: string;
  type: QuestionType;
  prompt: string;
  order: number;
  options?: string[];
  correctAnswer?: string;
  maxLength?: number;
};

export type QuizDetailResponse = QuizResponse & {
  questions: QuestionResponse[];
};

export type PublishedQuizLiveSession = {
  sessionId: string;
  status: "WAITING" | "LIVE";
  participantCount: number;
};

export type PublishedQuizResponse = {
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
