export type SessionStatus = "WAITING" | "LIVE" | "FINISHED";

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
};

export type SessionRoomState = Session & {
  participants: SessionParticipant[];
};
