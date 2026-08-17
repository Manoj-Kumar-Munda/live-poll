import { ApiResponse } from "@/shared/utils/api-response.js";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import {
  createSessionSchema,
  joinSessionSchema,
  listSessionsQuerySchema,
  sessionIdParamsSchema,
} from "./session.schema.js";
import * as sessionService from "./session.service.js";

export const listSessions = asyncHandler(async (req, res) => {
  const query = listSessionsQuerySchema.parse(req.query);
  const sessions = await sessionService.listSessions(req.user!.id, query);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Sessions fetched",
      data: { sessions },
    }),
  );
});

export const createSession = asyncHandler(async (req, res) => {
  const input = createSessionSchema.parse(req.body);
  const session = await sessionService.createSession(req.user!.id, input);

  res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      message: "Session created",
      data: { session },
    }),
  );
});

export const getSessionById = asyncHandler(async (req, res) => {
  const { sessionId } = sessionIdParamsSchema.parse(req.params);
  const session = await sessionService.getSessionById(
    req.user!.id,
    sessionId,
  );

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Session fetched",
      data: { session },
    }),
  );
});

export const joinSession = asyncHandler(async (req, res) => {
  const input = joinSessionSchema.parse(req.body);
  const displayName = req.user!.name ?? "Player";
  const session = await sessionService.joinSession(
    req.user!.id,
    displayName,
    input,
  );

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Joined session",
      data: { session },
    }),
  );
});

export const startSession = asyncHandler(async (req, res) => {
  const { sessionId } = sessionIdParamsSchema.parse(req.params);
  const session = await sessionService.startSession(req.user!.id, sessionId);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Session started",
      data: { session },
    }),
  );
});

export const endSession = asyncHandler(async (req, res) => {
  const { sessionId } = sessionIdParamsSchema.parse(req.params);
  const session = await sessionService.endSession(req.user!.id, sessionId);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Session ended",
      data: { session },
    }),
  );
});

export const leaveSession = asyncHandler(async (req, res) => {
  const { sessionId } = sessionIdParamsSchema.parse(req.params);
  const session = await sessionService.leaveSession(req.user!.id, sessionId);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Left session",
      data: { session },
    }),
  );
});
