import type { PublishedQuizStatusFilter } from "../types";

export const publishedQuizKeys = {
  all: ["published-quizzes"] as const,
  lists: () => [...publishedQuizKeys.all, "list"] as const,
  list: (status?: PublishedQuizStatusFilter) =>
    [...publishedQuizKeys.lists(), { status }] as const,
};
