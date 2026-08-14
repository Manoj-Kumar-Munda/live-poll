import mongoose from "mongoose";
import {
  toQuestionCreateDocument,
  toQuizCreateDocument,
  toQuizUpdateDocument,
  type AddQuestionInput,
  type CreateQuizInput,
  type ListQuizzesQuery,
  type UpdateQuizFields,
} from "./quiz.schema.js";
import { Question, type QuestionDocument } from "./question.model.js";
import { QuizQuestion } from "./quiz-question.model.js";
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
  question: QuestionDocument,
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

async function countQuestions(quizId: string): Promise<number> {
  return QuizQuestion.countDocuments({ quizId });
}

async function countQuestionsByQuizIds(
  quizIds: mongoose.Types.ObjectId[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (quizIds.length === 0) {
    return counts;
  }

  const rows = await QuizQuestion.aggregate<{
    _id: mongoose.Types.ObjectId;
    count: number;
  }>([
    { $match: { quizId: { $in: quizIds } } },
    { $group: { _id: "$quizId", count: { $sum: 1 } } },
  ]);

  for (const row of rows) {
    counts.set(row._id.toString(), row.count);
  }

  return counts;
}

async function loadOrderedQuestions(
  quizId: string,
): Promise<QuestionResponse[]> {
  const links = await QuizQuestion.find({ quizId }).sort({ order: 1 }).exec();
  const questionIds = links.map((link) => link.questionId);
  const questions = await Question.find({ _id: { $in: questionIds } }).exec();
  const byId = new Map(
    questions.map((question) => [question._id.toString(), question]),
  );

  return links.flatMap((link) => {
    const question = byId.get(link.questionId.toString());
    if (!question) {
      return [];
    }
    return [toQuestionResponse(question as QuestionDocument, link.order)];
  });
}

async function requireOwnedQuiz(ownerId: string, id: string) {
  const quiz = await Quiz.findOne({ _id: id, ownerId }).exec();
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }
  return quiz;
}

async function withMongoTransaction<T>(
  work: (session: mongoose.ClientSession) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result: T | undefined;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    if (result === undefined) {
      throw new Error("Transaction completed without a result");
    }
    return result;
  } finally {
    await session.endSession();
  }
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
  const counts = await countQuestionsByQuizIds(quizzes.map((quiz) => quiz._id));

  return quizzes.map((quiz) =>
    toQuizResponse(
      quiz as QuizDocument,
      counts.get(quiz._id.toString()) ?? 0,
    ),
  );
}

export async function getQuizById(
  ownerId: string,
  id: string,
): Promise<QuizDetailResponse> {
  const quiz = await requireOwnedQuiz(ownerId, id);
  const questions = await loadOrderedQuestions(id);

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

  const questionCount = await countQuestions(id);
  return toQuizResponse(updatedQuiz as QuizDocument, questionCount);
}

export async function deleteQuizById(
  ownerId: string,
  id: string,
): Promise<void> {
  await withMongoTransaction(async (session) => {
    const quiz = await Quiz.findOne({ _id: id, ownerId }).session(session);
    if (!quiz) {
      throw new ApiError(404, "Quiz not found");
    }

    const links = await QuizQuestion.find({ quizId: id }).session(session);
    const questionIds = links.map((link) => link.questionId);

    await QuizQuestion.deleteMany({ quizId: id }).session(session);
    if (questionIds.length > 0) {
      await Question.deleteMany({ _id: { $in: questionIds } }).session(session);
    }
    await Quiz.deleteOne({ _id: id, ownerId }).session(session);
  });
}

export async function addQuestion(
  ownerId: string,
  quizId: string,
  input: AddQuestionInput,
): Promise<QuestionResponse> {
  return withMongoTransaction(async (session) => {
    const lastLink = await QuizQuestion.findOne({ quizId })
      .sort({ order: -1 })
      .select({ order: 1 })
      .session(session)
      .lean();
    const minNextOrder = lastLink ? lastLink.order + 1 : 0;

    const quiz = await Quiz.findOneAndUpdate(
      { _id: quizId, ownerId, status: QUIZ_STATUS.DRAFT },
      [
        {
          $set: {
            nextQuestionOrder: {
              $add: [
                {
                  $max: [
                    { $ifNull: ["$nextQuestionOrder", 0] },
                    minNextOrder,
                  ],
                },
                1,
              ],
            },
          },
        },
      ],
      { new: true, session },
    );

    if (!quiz) {
      const existing = await Quiz.findOne({ _id: quizId, ownerId }).session(
        session,
      );
      if (!existing) {
        throw new ApiError(404, "Quiz not found");
      }
      throw new ApiError(400, "Questions can only be added to draft quizzes");
    }

    const order = quiz.nextQuestionOrder - 1;

    const [question] = await Question.create(
      [toQuestionCreateDocument(ownerId, input)],
      { session },
    );

    if (!question) {
      throw new ApiError(500, "Failed to create question");
    }

    await QuizQuestion.create(
      [
        {
          quizId: quiz._id,
          questionId: question._id,
          order,
        },
      ],
      { session },
    );

    return toQuestionResponse(question as QuestionDocument, order);
  });
}
