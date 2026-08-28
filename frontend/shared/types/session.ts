export type SessionStatus = "WAITING" | "LIVE" | "FINISHED";

export type QuestionType = "MCQ" | "POLL" | "OPEN_TEXT";

export type ParticipantStatus = "ACTIVE" | "QUIT" | "FINISHED";

export type SessionParticipant = {
  id: string;
  userId: string;
  displayName: string;
  status: ParticipantStatus;
  score: number;
  finalRank: number | null;
  joinedAt: string;
};

export type Session = {
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

export type SessionDetail = Session & {
  role: "host" | "participant";
  participants: SessionParticipant[];
  myScore?: number;
  myRank?: number | null;
  myQuestionsAnswered?: number;
  viewerUserId?: string;
};

export type SessionRoomState = Session & {
  participants: SessionParticipant[];
};

export type LiveQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  order: number;
  options?: string[];
  maxLength?: number;
};

export type QuestionStartedPayload = {
  sessionId: string;
  index: number;
  question: LiveQuestion;
  endsAt: string;
  serverNow: string;
};

export type QuestionEndedPayload = {
  sessionId: string;
  index: number;
  reason: "timer" | "host";
};

export type QuestionAnswerPayload = {
  sessionId: string;
  index: number;
  value: string;
};

export type QuestionAnsweredPayload = {
  sessionId: string;
  index: number;
  value: string;
};

export type OptionResult = {
  option: string;
  count: number;
  percent: number;
};

export type WordCloudTerm = {
  key: string;
  label: string;
  count: number;
};

export type WordResult = {
  key: string;
  label: string;
  count: number;
};

export type WordCloudUpdatedPayload = {
  sessionId: string;
  index: number;
  term: WordCloudTerm;
  isNew: boolean;
};

export type WordCloudSnapshotPayload = {
  sessionId: string;
  index: number;
  terms: WordCloudTerm[];
};

export type QuestionResultsPayload = {
  sessionId: string;
  index: number;
  question: LiveQuestion;
  optionResults?: OptionResult[];
  wordResults?: WordResult[];
  correctAnswer?: string;
  totalAnswers: number;
};

export type ParticipantSessionItem = Session & {
  participantStatus: ParticipantStatus;
  score: number;
  rank: number | null;
  questionsAnswered: number;
};

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
};

export type LeaderboardUpdatedPayload = {
  sessionId: string;
  entries: LeaderboardEntry[];
  final: boolean;
};

export type HostDashboardStats = {
  totalEventsHosted: number;
  totalParticipants: number;
  avgParticipantsPerEvent: number;
};

export type ParticipantHomeStats = {
  totalQuizzesPlayed: number;
  totalScore: number;
  bestRank: number | null;
  totalQuestionsAnswered: number;
};
