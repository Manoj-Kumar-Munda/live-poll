import { ApiResponse } from "@/shared/utils/api-response.js";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { createQuizSchema } from "./quiz.schema.js";
import * as quizService from "./quiz.service.js";

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
