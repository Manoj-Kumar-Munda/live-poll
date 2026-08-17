import { z } from "zod";
import { SESSION_LIMITS, ROOM_CODE_CHARS } from "./session.constants.js";
import { SESSION_STATUSES } from "@/types/session.types.js";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid id");

const roomCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(
    SESSION_LIMITS.roomCodeLength,
    `Room code must be ${SESSION_LIMITS.roomCodeLength} characters`,
  )
  .regex(
    new RegExp(`^[${ROOM_CODE_CHARS}]+$`),
    "Room code contains invalid characters",
  );

export const createSessionSchema = z.object({
  quizId: objectIdSchema,
});

export const listSessionsQuerySchema = z.object({
  quizId: objectIdSchema.optional(),
  status: z.enum(SESSION_STATUSES).optional(),
});

export const sessionIdParamsSchema = z.object({
  sessionId: objectIdSchema,
});

export const joinSessionSchema = z.object({
  roomCode: roomCodeSchema,
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
export type JoinSessionInput = z.infer<typeof joinSessionSchema>;
