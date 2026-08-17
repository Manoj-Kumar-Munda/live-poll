"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateQuizInput,
  QuestionInput,
  QuizStatus,
  UpdateQuizInput,
} from "../types";
import { quizKeys } from "./quiz-keys";
import * as quizApi from "./quizzes";

export function useQuizzes(status?: QuizStatus) {
  return useQuery({
    queryKey: quizKeys.list(status),
    queryFn: () => quizApi.listQuizzes(status),
  });
}

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: quizKeys.detail(quizId),
    queryFn: () => quizApi.getQuiz(quizId),
  });
}

function useInvalidateQuizzes() {
  const queryClient = useQueryClient();

  return (quizId?: string) => {
    queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    if (quizId) {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) });
    }
  };
}

export function useCreateQuiz() {
  const invalidate = useInvalidateQuizzes();

  return useMutation({
    mutationFn: (input: CreateQuizInput) => quizApi.createQuiz(input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateQuiz(quizId: string) {
  const invalidate = useInvalidateQuizzes();

  return useMutation({
    mutationFn: (input: UpdateQuizInput) => quizApi.updateQuiz(quizId, input),
    onSuccess: () => invalidate(quizId),
  });
}

export function useDeleteQuiz() {
  const invalidate = useInvalidateQuizzes();

  return useMutation({
    mutationFn: (quizId: string) => quizApi.deleteQuiz(quizId),
    onSuccess: () => invalidate(),
  });
}

export function useAddQuestion(quizId: string) {
  const invalidate = useInvalidateQuizzes();

  return useMutation({
    mutationFn: (input: QuestionInput) => quizApi.addQuestion(quizId, input),
    onSuccess: () => invalidate(quizId),
  });
}

export function useUpdateQuestion(quizId: string) {
  const invalidate = useInvalidateQuizzes();

  return useMutation({
    mutationFn: ({
      questionId,
      input,
    }: {
      questionId: string;
      input: QuestionInput;
    }) => quizApi.updateQuestion(quizId, questionId, input),
    onSuccess: () => invalidate(quizId),
  });
}

export function useDeleteQuestion(quizId: string) {
  const invalidate = useInvalidateQuizzes();

  return useMutation({
    mutationFn: (questionId: string) =>
      quizApi.deleteQuestion(quizId, questionId),
    onSuccess: () => invalidate(quizId),
  });
}

export function usePublishQuiz(quizId: string) {
  const invalidate = useInvalidateQuizzes();

  return useMutation({
    mutationFn: () => quizApi.publishQuiz(quizId),
    onSuccess: () => invalidate(quizId),
  });
}

export function useArchiveQuiz(quizId: string) {
  const invalidate = useInvalidateQuizzes();

  return useMutation({
    mutationFn: () => quizApi.archiveQuiz(quizId),
    onSuccess: () => invalidate(quizId),
  });
}
