import { api } from "@/lib/api";
import type {
  CreateQuizInput,
  Question,
  QuestionInput,
  Quiz,
  QuizDetail,
  QuizStatus,
  UpdateQuizInput,
} from "../types";

export async function listQuizzes(status?: QuizStatus) {
  const { data } = await api.get<{ quizzes: Quiz[] }>("/api/quizzes", {
    params: status ? { status } : undefined,
  });
  return data.quizzes;
}

export async function createQuiz(input: CreateQuizInput) {
  const { data } = await api.post<{ quiz: Quiz }>("/api/quizzes", input);
  return data.quiz;
}

export async function getQuiz(id: string) {
  const { data } = await api.get<{ quiz: QuizDetail }>(`/api/quizzes/${id}`);
  return data.quiz;
}

export async function updateQuiz(id: string, input: UpdateQuizInput) {
  const { data } = await api.put<{ quiz: Quiz }>(`/api/quizzes/${id}`, input);
  return data.quiz;
}

export async function deleteQuiz(id: string) {
  await api.delete(`/api/quizzes/${id}`);
}

export async function addQuestion(quizId: string, input: QuestionInput) {
  const { data } = await api.post<{ question: Question }>(
    `/api/quizzes/${quizId}/questions`,
    input,
  );
  return data.question;
}

export async function updateQuestion(
  quizId: string,
  questionId: string,
  input: QuestionInput,
) {
  const { data } = await api.patch<{ question: Question }>(
    `/api/quizzes/${quizId}/questions/${questionId}`,
    input,
  );
  return data.question;
}

export async function deleteQuestion(quizId: string, questionId: string) {
  await api.delete(`/api/quizzes/${quizId}/questions/${questionId}`);
}

export async function publishQuiz(id: string) {
  const { data } = await api.post<{ quiz: Quiz }>(`/api/quizzes/${id}/publish`);
  return data.quiz;
}

export async function archiveQuiz(id: string) {
  const { data } = await api.post<{ quiz: Quiz }>(`/api/quizzes/${id}/archive`);
  return data.quiz;
}
