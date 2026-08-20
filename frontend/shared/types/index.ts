// Shared domain types used across modules.

export type UserRole = "host" | "participant";

export type {
  ParticipantStatus,
  Session,
  SessionDetail,
  SessionParticipant,
  SessionRoomState,
  SessionStatus,
} from "./session";
