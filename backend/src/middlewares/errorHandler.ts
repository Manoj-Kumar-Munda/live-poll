import {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { ZodError } from "zod";
import { env } from "@/config/env.js";
import { ApiError } from "@/shared/utils/api-error.js";
import { ApiResponse } from "@/shared/utils/api-response.js";

function logServerError(err: unknown): void {
  if (err instanceof Error) {
    console.error(err.stack ?? err.message);
    return;
  }

  console.error(err);
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    const response = new ApiResponse({
      statusCode: 400,
      message: "Validation failed",
      data: null,
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });

    res.status(400).json(response);
    return;
  }

  if (err instanceof ApiError) {
    const response = new ApiResponse({
      statusCode: err.statusCode,
      message: err.message,
      data: null,
      errors: err.errors,
    });

    res.status(err.statusCode).json(response);
    return;
  }

  logServerError(err);

  const statusCode = 500;
  const message =
    env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err instanceof Error
        ? err.message
        : "Internal Server Error";

  const response = new ApiResponse({
    statusCode,
    message,
    data: null,
    errors: [],
  });

  res.status(statusCode).json(response);
};
