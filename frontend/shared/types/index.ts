// Shared domain types used across modules.

export type UserRole = "host" | "participant";

export type {
  HostDashboardStats,
  LeaderboardEntry,
  LeaderboardUpdatedPayload,
  LiveQuestion,
  ParticipantSessionItem,
  ParticipantStatus,
  QuestionAnsweredPayload,
  QuestionEndedPayload,
  QuestionResultsPayload,
  QuestionStartedPayload,
  QuestionType,
  Session,
  SessionDetail,
  SessionParticipant,
  SessionRoomState,
  SessionStatus,
} from "./session";
