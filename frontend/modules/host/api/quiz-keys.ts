import type { QuizStatus } from "../types";

export const quizKeys = {
  all: ["quizzes"] as const,
  lists: () => [...quizKeys.all, "list"] as const,
  list: (status?: QuizStatus) => [...quizKeys.lists(), { status }] as const,
  details: () => [...quizKeys.all, "detail"] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
};
