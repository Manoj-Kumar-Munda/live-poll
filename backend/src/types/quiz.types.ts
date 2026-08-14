export const QUIZ_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type QuizStatus = (typeof QUIZ_STATUS)[keyof typeof QUIZ_STATUS];

export const QUIZ_STATUSES = Object.values(QUIZ_STATUS) as QuizStatus[];

export const QUESTION_TYPE = {
  MCQ: "MCQ",
  POLL: "POLL",
  OPEN_TEXT: "OPEN_TEXT",
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

export const QUESTION_TYPES = Object.values(QUESTION_TYPE) as QuestionType[];

export const PARTICIPANT_STATUS = {
  ACTIVE: "ACTIVE",
  QUIT: "QUIT",
  FINISHED: "FINISHED",
} as const;

export type ParticipantStatus =
  (typeof PARTICIPANT_STATUS)[keyof typeof PARTICIPANT_STATUS];

export const PARTICIPANT_STATUSES = Object.values(
  PARTICIPANT_STATUS,
) as ParticipantStatus[];

export type QuizResponse = {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  status: QuizStatus;
  pointsPerQuestion: number;
  timeLimitSeconds: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
};
