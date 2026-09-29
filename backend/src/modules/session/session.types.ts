import type { ParticipantStatus } from "@/types/quiz.types.js";
import type { QuestionType } from "@/types/quiz.types.js";
import type { SessionStatus } from "@/types/session.types.js";

type SessionParticipantResponse = {
  id: string;
  userId: string;
  displayName: string;
  status: ParticipantStatus;
  score: number;
  finalRank: number | null;
  joinedAt: string;
};

type SessionResponse = {
  id: string;
  quizId: string;
  quizTitle: string;
  hostId: string;
  roomCode: string;
  status: SessionStatus;
  participantCount: number;
  currentQuestionIndex: number;
  questionEndsAt: string | null;
  expiresAt: string;
  liveStartedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type SessionDetailResponse = SessionResponse & {
  role: "host" | "participant";
  participants: SessionParticipantResponse[];
  myScore?: number;
  myRank?: number | null;
  myQuestionsAnswered?: number;
  viewerUserId?: string;
};

/** Broadcast to everyone in a session socket room (no per-user role). */
type SessionRoomState = SessionResponse & {
  participants: SessionParticipantResponse[];
};

type ParticipantSessionItem = SessionResponse & {
  participantStatus: ParticipantStatus;
  score: number;
  rank: number | null;
  questionsAnswered: number;
};

type LiveQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  order: number;
  options?: string[];
  maxLength?: number;
};

type QuestionStartedPayload = {
  sessionId: string;
  index: number;
  question: LiveQuestion;
  endsAt: string;
  // serverNow is the server's current time when the question starts, sent alongside endsAt.
  serverNow: string;
};

type QuestionEndedPayload = {
  sessionId: string;
  index: number;
  reason: "timer" | "host";
};

type QuestionAnsweredPayload = {
  sessionId: string;
  index: number;
  value: string;
};

type OptionResult = {
  option: string;
  count: number;
  percent: number;
};

type WordCloudTerm = {
  key: string;
  label: string;
  count: number;
};

type WordResult = {
  key: string;
  label: string;
  count: number;
};

type WordCloudUpdatedPayload = {
  sessionId: string;
  index: number;
  term: WordCloudTerm;
  isNew: boolean;
};

type WordCloudSnapshotPayload = {
  sessionId: string;
  index: number;
  terms: WordCloudTerm[];
};

type QuestionResultsPayload = {
  sessionId: string;
  index: number;
  question: LiveQuestion;
  optionResults?: OptionResult[];
  wordResults?: WordResult[];
  correctAnswer?: string;
  totalAnswers: number;
};

type LeaderboardEntry = {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
};

type LeaderboardUpdatedPayload = {
  sessionId: string;
  entries: LeaderboardEntry[];
  final: boolean;
};

type HostDashboardStats = {
  totalEventsHosted: number;
  totalParticipants: number;
  avgParticipantsPerEvent: number;
};

type ParticipantHomeStats = {
  totalQuizzesPlayed: number;
  totalScore: number;
  bestRank: number | null;
  totalQuestionsAnswered: number;
};

export type {
  SessionParticipantResponse,
  SessionResponse,
  SessionDetailResponse,
  SessionRoomState,
  ParticipantSessionItem,
  LiveQuestion,
  QuestionStartedPayload,
  QuestionEndedPayload,
  QuestionAnsweredPayload,
  OptionResult,
  WordCloudTerm,
  WordResult,
  WordCloudUpdatedPayload,
  WordCloudSnapshotPayload,
  QuestionResultsPayload,
  LeaderboardEntry,
  LeaderboardUpdatedPayload,
  HostDashboardStats,
  ParticipantHomeStats,
};
