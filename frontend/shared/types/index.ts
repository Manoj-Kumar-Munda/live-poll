// Shared domain types used across modules.

export type UserRole = "host" | "participant";

export type {
  LiveQuestion,
  ParticipantSessionItem,
  ParticipantStatus,
  QuestionAnsweredPayload,
  QuestionEndedPayload,
  QuestionStartedPayload,
  QuestionType,
  Session,
  SessionDetail,
  SessionParticipant,
  SessionRoomState,
  SessionStatus,
} from "./session";
