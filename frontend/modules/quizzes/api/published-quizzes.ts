import { api } from "@/lib/api";
import type { PublishedQuiz, PublishedQuizStatusFilter } from "../types";

export async function listPublishedQuizzes(status?: PublishedQuizStatusFilter) {
  const { data } = await api.get<{ quizzes: PublishedQuiz[] }>(
    "/api/quizzes/published",
    { params: status ? { status } : undefined },
  );
  return data.quizzes;
}
