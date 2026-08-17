export type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type QuestionType = "MCQ" | "POLL" | "OPEN_TEXT";

export type Quiz = {
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

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  order: number;
  options?: string[];
  correctAnswer?: string;
  maxLength?: number;
};

export type QuizDetail = Quiz & {
  questions: Question[];
};

export type CreateQuizInput = {
  title: string;
  description?: string;
  pointsPerQuestion?: number;
  timeLimitSeconds?: number;
};

export type UpdateQuizInput = {
  title?: string;
  description?: string;
  pointsPerQuestion?: number;
  timeLimitSeconds?: number;
};

export type QuestionInput =
  | {
      type: "MCQ";
      prompt: string;
      options: string[];
      correctAnswer: string;
    }
  | {
      type: "POLL";
      prompt: string;
      options: string[];
    }
  | {
      type: "OPEN_TEXT";
      prompt: string;
      maxLength?: number;
    };
