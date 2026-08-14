import type { QuizStatus } from "@/types/quiz.types.js";

/** API response shape for quiz endpoints in this module. */
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
