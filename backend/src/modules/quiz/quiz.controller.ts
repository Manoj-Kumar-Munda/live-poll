import { ApiResponse } from "@/shared/utils/api-response.js";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import {
  addQuestionParamsSchema,
  addQuestionSchema,
  createQuizSchema,
  deleteQuizByIdSchema,
  getQuizByIdSchema,
  listPublishedQuizzesQuerySchema,
  listQuizzesQuerySchema,
  questionOnQuizParamsSchema,
  quizActionParamsSchema,
  updateQuizByIdSchema,
  updateQuizFieldsSchema,
} from "./quiz.schema.js";
import * as quizService from "./quiz.service.js";
import { listPublishedQuizzes } from "./published-quiz.service.js";

export const listPublishedQuizzesHandler = asyncHandler(async (req, res) => {
  const query = listPublishedQuizzesQuerySchema.parse(req.query);
  const quizzes = await listPublishedQuizzes(query);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Published quizzes fetched",
      data: { quizzes },
    }),
  );
});

export const listQuizzes = asyncHandler(async (req, res) => {
  const query = listQuizzesQuerySchema.parse(req.query);
  const quizzes = await quizService.listQuizzes(req.user!.id, query);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Quizzes fetched",
      data: { quizzes },
    }),
  );
});

export const createQuiz = asyncHandler(async (req, res) => {
  const input = createQuizSchema.parse(req.body);
  const quiz = await quizService.createQuiz(req.user!.id, input);

  res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      message: "Quiz created",
      data: { quiz },
    }),
  );
});

export const getQuizById = asyncHandler(async (req, res) => {
  const { id } = getQuizByIdSchema.parse({ id: req.params.quizId });
  const quiz = await quizService.getQuizById(req.user!.id, id);
  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Quiz fetched",
      data: { quiz },
    }),
  );
});

export const updateQuizById = asyncHandler(async (req, res) => {
  const { id } = updateQuizByIdSchema.parse({ id: req.params.quizId });
  const fields = updateQuizFieldsSchema.parse(req.body);
  const quiz = await quizService.updateQuizById(req.user!.id, id, fields);
  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Quiz updated",
      data: { quiz },
    }),
  );
});

export const deleteQuizById = asyncHandler(async (req, res) => {
  const { id } = deleteQuizByIdSchema.parse({ id: req.params.quizId });
  await quizService.deleteQuizById(req.user!.id, id);
  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Quiz deleted",
      data: null,
    }),
  );
});

export const addQuestion = asyncHandler(async (req, res) => {
  const { quizId } = addQuestionParamsSchema.parse(req.params);
  const input = addQuestionSchema.parse(req.body);
  const question = await quizService.addQuestion(req.user!.id, quizId, input);

  res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      message: "Question added",
      data: { question },
    }),
  );
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const { quizId, questionId } = questionOnQuizParamsSchema.parse(req.params);
  const input = addQuestionSchema.parse(req.body);
  const question = await quizService.updateQuestion(
    req.user!.id,
    quizId,
    questionId,
    input,
  );

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Question updated",
      data: { question },
    }),
  );
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const { quizId, questionId } = questionOnQuizParamsSchema.parse(req.params);
  await quizService.deleteQuestion(req.user!.id, quizId, questionId);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Question deleted",
      data: null,
    }),
  );
});

export const publishQuiz = asyncHandler(async (req, res) => {
  const { quizId } = quizActionParamsSchema.parse(req.params);
  const quiz = await quizService.publishQuiz(req.user!.id, quizId);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Quiz published",
      data: { quiz },
    }),
  );
});

export const archiveQuiz = asyncHandler(async (req, res) => {
  const { quizId } = quizActionParamsSchema.parse(req.params);
  const quiz = await quizService.archiveQuiz(req.user!.id, quizId);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Quiz archived",
      data: { quiz },
    }),
  );
});
