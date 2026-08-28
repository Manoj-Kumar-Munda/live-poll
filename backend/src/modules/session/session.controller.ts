import { ApiResponse } from "@/shared/utils/api-response.js";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import {
  assertGuestSessionAccess,
  clearGuestCookie,
  requireAuthOrGuest,
  setGuestCookie,
} from "@/modules/auth/guest-auth.js";
import {
  createSessionSchema,
  guestJoinSessionSchema,
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

export const listMySessions = asyncHandler(async (req, res) => {
  const sessions = await sessionService.listParticipantSessions(req.user!.id);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Sessions fetched",
      data: { sessions },
    }),
  );
});

export const getHostDashboardStats = asyncHandler(async (req, res) => {
  const stats = await sessionService.getHostDashboardStats(req.user!.id);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Host dashboard stats fetched",
      data: { stats },
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
  assertGuestSessionAccess(req, sessionId);
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

export const guestJoinSession = asyncHandler(async (req, res) => {
  const input = guestJoinSessionSchema.parse(req.body);
  const { session, guest } = await sessionService.guestJoinSession(input);
  await setGuestCookie(res, guest);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Joined session",
      data: { session },
    }),
  );
});

export const guestLogout = asyncHandler(async (_req, res) => {
  clearGuestCookie(res);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Guest session cleared",
      data: null,
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
  assertGuestSessionAccess(req, sessionId);
  const session = await sessionService.leaveSession(req.user!.id, sessionId);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Left session",
      data: { session },
    }),
  );
});
