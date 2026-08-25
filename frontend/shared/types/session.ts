export type SessionStatus = "WAITING" | "LIVE" | "FINISHED";

export type QuestionType = "MCQ" | "POLL" | "OPEN_TEXT";

export type ParticipantStatus = "ACTIVE" | "QUIT" | "FINISHED";

export type SessionParticipant = {
  id: string;
  userId: string;
  displayName: string;
  status: ParticipantStatus;
  score: number;
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
  myQuestionsAnswered?: number;
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

export type QuestionResultsPayload = {
  sessionId: string;
  index: number;
  question: LiveQuestion;
  optionResults: OptionResult[];
  correctAnswer?: string;
  totalAnswers: number;
};

export type ParticipantSessionItem = Session & {
  participantStatus: ParticipantStatus;
  score: number;
  questionsAnswered: number;
};
