import {
  toQuizCreateDocument,
  toQuizUpdateDocument,
  type CreateQuizInput,
  type ListQuizzesQuery,
  type UpdateQuizFields,
} from "./quiz.schema.js";
import { Quiz, type QuizDocument } from "./quiz.model.js";
import type { QuizResponse } from "./quiz.types.js";
import { QUIZ_STATUS, type QuizStatus } from "@/types/quiz.types.js";
import { ApiError } from "@/shared/utils/api-error.js";

function toQuizResponse(quiz: QuizDocument, questionCount = 0): QuizResponse {
  return {
    id: quiz._id.toString(),
    ownerId: quiz.ownerId,
    title: quiz.title,
    description: quiz.description ?? null,
    status: quiz.status,
    pointsPerQuestion: quiz.pointsPerQuestion,
    timeLimitSeconds: Math.round(quiz.durationPerQuestion / 1000),
    questionCount,
    createdAt: quiz.createdAt.toISOString(),
    updatedAt: quiz.updatedAt.toISOString(),
  };
}

export async function createQuiz(
  ownerId: string,
  input: CreateQuizInput,
): Promise<QuizResponse> {
  const quiz = await Quiz.create(toQuizCreateDocument(ownerId, input));

  return toQuizResponse(quiz as QuizDocument);
}

export async function listQuizzes(
  ownerId: string,
  query: ListQuizzesQuery,
): Promise<QuizResponse[]> {
  const filter: { ownerId: string; status?: QuizStatus } = { ownerId };

  if (query.status) {
    filter.status = query.status;
  }

  const quizzes = await Quiz.find(filter).sort({ updatedAt: -1 }).exec();

  return quizzes.map((quiz) => toQuizResponse(quiz as QuizDocument));
}

export async function getQuizById(
  ownerId: string,
  id: string,
): Promise<QuizResponse> {
  const quiz = await Quiz.findOne({ _id: id, ownerId }).exec();
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }
  return toQuizResponse(quiz as QuizDocument);
}

export async function updateQuizById(
  ownerId: string,
  id: string,
  fields: UpdateQuizFields,
): Promise<QuizResponse> {
  const quiz = await Quiz.findOne({ _id: id, ownerId }).exec();

  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  if (quiz.status !== QUIZ_STATUS.DRAFT) {
    throw new ApiError(400, "Only draft quizzes can be updated");
  }

  const updatedQuiz = await Quiz.findOneAndUpdate(
    { _id: id, ownerId, status: QUIZ_STATUS.DRAFT },
    toQuizUpdateDocument(fields),
    { new: true, runValidators: true },
  ).exec();

  if (!updatedQuiz) {
    throw new ApiError(404, "Quiz not found");
  }

  return toQuizResponse(updatedQuiz as QuizDocument);
}
