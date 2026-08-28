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

export const guestJoinSessionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(254),
  roomCode: roomCodeSchema,
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
export type JoinSessionInput = z.infer<typeof joinSessionSchema>;
export type GuestJoinSessionInput = z.infer<typeof guestJoinSessionSchema>;
