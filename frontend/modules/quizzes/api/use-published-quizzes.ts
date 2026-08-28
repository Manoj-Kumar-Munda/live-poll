"use client";

import { useQuery } from "@tanstack/react-query";
import type { PublishedQuizStatusFilter } from "../types";
import { publishedQuizKeys } from "./quiz-keys";
import * as publishedQuizApi from "./published-quizzes";

export function usePublishedQuizzes(status?: PublishedQuizStatusFilter) {
  return useQuery({
    queryKey: publishedQuizKeys.list(status),
    queryFn: () => publishedQuizApi.listPublishedQuizzes(status),
  });
}
