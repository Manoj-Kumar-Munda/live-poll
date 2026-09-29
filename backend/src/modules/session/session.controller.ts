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

const listSessions = asyncHandler(async (req, res) => {
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

const listMySessions = asyncHandler(async (req, res) => {
  const sessions = await sessionService.listParticipantSessions(req.user!.id);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Sessions fetched",
      data: { sessions },
    }),
  );
});

const getHostDashboardStats = asyncHandler(async (req, res) => {
  const stats = await sessionService.getHostDashboardStats(req.user!.id);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Host dashboard stats fetched",
      data: { stats },
    }),
  );
});

const getParticipantHomeStats = asyncHandler(async (req, res) => {
  const stats = await sessionService.getParticipantHomeStats(req.user!.id);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Participant home stats fetched",
      data: { stats },
    }),
  );
});

const createSession = asyncHandler(async (req, res) => {
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

const getSessionById = asyncHandler(async (req, res) => {
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

const guestJoinSession = asyncHandler(async (req, res) => {
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

const guestLogout = asyncHandler(async (_req, res) => {
  clearGuestCookie(res);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Guest session cleared",
      data: null,
    }),
  );
});

const joinSession = asyncHandler(async (req, res) => {
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

const startSession = asyncHandler(async (req, res) => {
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

const endSession = asyncHandler(async (req, res) => {
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

const leaveSession = asyncHandler(async (req, res) => {
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

export {
  listSessions,
  listMySessions,
  getHostDashboardStats,
  getParticipantHomeStats,
  createSession,
  getSessionById,
  guestJoinSession,
  guestLogout,
  joinSession,
  startSession,
  endSession,
  leaveSession,
};
