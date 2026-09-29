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

const createSessionSchema = z.object({
  quizId: objectIdSchema,
});

const listSessionsQuerySchema = z.object({
  quizId: objectIdSchema.optional(),
  status: z.enum(SESSION_STATUSES).optional(),
});

const sessionIdParamsSchema = z.object({
  sessionId: objectIdSchema,
});

const joinSessionSchema = z.object({
  roomCode: roomCodeSchema,
});

const guestJoinSessionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(254),
  roomCode: roomCodeSchema,
});

type CreateSessionInput = z.infer<typeof createSessionSchema>;
type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
type JoinSessionInput = z.infer<typeof joinSessionSchema>;
type GuestJoinSessionInput = z.infer<typeof guestJoinSessionSchema>;

export {
  createSessionSchema,
  listSessionsQuerySchema,
  sessionIdParamsSchema,
  joinSessionSchema,
  guestJoinSessionSchema,
};
export type {
  CreateSessionInput,
  ListSessionsQuery,
  JoinSessionInput,
  GuestJoinSessionInput,
};
