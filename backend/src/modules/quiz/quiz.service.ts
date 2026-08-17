import {
  toQuestionSubdocument,
  toQuizCreateDocument,
  toQuizUpdateDocument,
  type AddQuestionInput,
  type CreateQuizInput,
  type ListQuizzesQuery,
  type UpdateQuizFields,
} from "./quiz.schema.js";
import type { QuestionSubdocument } from "./question.model.js";
import { Quiz, type QuizDocument } from "./quiz.model.js";
import type {
  QuestionResponse,
  QuizDetailResponse,
  QuizResponse,
} from "./quiz.types.js";
import {
  QUESTION_TYPE,
  QUIZ_STATUS,
  type QuizStatus,
} from "@/types/quiz.types.js";
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

function toQuestionResponse(
  question: QuestionSubdocument,
  order: number,
): QuestionResponse {
  const response: QuestionResponse = {
    id: question._id.toString(),
    type: question.type,
    prompt: question.prompt,
    order,
  };

  if (question.type === QUESTION_TYPE.MCQ && question.options) {
    response.options = question.options;
    if (question.correctAnswer) {
      response.correctAnswer = question.correctAnswer;
    }
  }

  if (question.type === QUESTION_TYPE.POLL && question.options) {
    response.options = question.options;
  }

  if (
    question.type === QUESTION_TYPE.OPEN_TEXT &&
    question.maxLength != null
  ) {
    response.maxLength = question.maxLength;
  }

  return response;
}

function toQuestionResponses(questions: QuestionSubdocument[]): QuestionResponse[] {
  return questions.map((question, order) => toQuestionResponse(question, order));
}

async function requireOwnedQuiz(ownerId: string, id: string) {
  const quiz = await Quiz.findOne({ _id: id, ownerId }).exec();
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }
  return quiz;
}

export async function createQuiz(
  ownerId: string,
  input: CreateQuizInput,
): Promise<QuizResponse> {
  const quiz = await Quiz.create(toQuizCreateDocument(ownerId, input));

  return toQuizResponse(quiz as QuizDocument, 0);
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

  return quizzes.map((quiz) =>
    toQuizResponse(quiz as QuizDocument, quiz.questions.length),
  );
}

export async function getQuizById(
  ownerId: string,
  id: string,
): Promise<QuizDetailResponse> {
  const quiz = await requireOwnedQuiz(ownerId, id);
  const questions = toQuestionResponses(quiz.questions as QuestionSubdocument[]);

  return {
    ...toQuizResponse(quiz as QuizDocument, questions.length),
    questions,
  };
}

export async function updateQuizById(
  ownerId: string,
  id: string,
  fields: UpdateQuizFields,
): Promise<QuizResponse> {
  const quiz = await requireOwnedQuiz(ownerId, id);

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

  return toQuizResponse(
    updatedQuiz as QuizDocument,
    updatedQuiz.questions.length,
  );
}

export async function deleteQuizById(
  ownerId: string,
  id: string,
): Promise<void> {
  const result = await Quiz.deleteOne({ _id: id, ownerId }).exec();
  if (result.deletedCount === 0) {
    throw new ApiError(404, "Quiz not found");
  }
}

export async function addQuestion(
  ownerId: string,
  quizId: string,
  input: AddQuestionInput,
): Promise<QuestionResponse> {
  const quiz = await Quiz.findOneAndUpdate(
    { _id: quizId, ownerId, status: QUIZ_STATUS.DRAFT },
    { $push: { questions: toQuestionSubdocument(input) } },
    { new: true, runValidators: true },
  ).exec();

  if (!quiz) {
    const existing = await Quiz.findOne({ _id: quizId, ownerId }).exec();
    if (!existing) {
      throw new ApiError(404, "Quiz not found");
    }
    throw new ApiError(400, "Questions can only be added to draft quizzes");
  }

  const question = quiz.questions[quiz.questions.length - 1] as QuestionSubdocument;
  return toQuestionResponse(question, quiz.questions.length - 1);
}
