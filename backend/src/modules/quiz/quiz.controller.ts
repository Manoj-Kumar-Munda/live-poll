import { ApiResponse } from "@/shared/utils/api-response.js";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { createQuizSchema, listQuizzesQuerySchema } from "./quiz.schema.js";
import * as quizService from "./quiz.service.js";

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
