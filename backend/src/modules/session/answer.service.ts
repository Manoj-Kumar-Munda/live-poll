import type { QuestionSubdocument } from "@/modules/quiz/question.model.js";
import { Quiz } from "@/modules/quiz/quiz.model.js";
import { PARTICIPANT_STATUS, QUESTION_TYPE } from "@/types/quiz.types.js";
import { SESSION_STATUS } from "@/types/session.types.js";
import { ApiError } from "@/shared/utils/api-error.js";
import { Answer } from "./answer.model.js";
import { SessionParticipant } from "./participant.model.js";
import { isWithinAnswerWindow } from "./session.constants.js";
import { Session, type SessionDocument } from "./session.model.js";

export type SubmittedAnswer = {
  index: number;
  value: string;
  questionId: string;
};

function normalizeAnswerValue(value: string) {
  return value.trim().toLowerCase();
}

function validateAnswerValue(
  question: QuestionSubdocument,
  normalizedValue: string,
) {
  if (!normalizedValue) {
    throw new ApiError(400, "Answer is required");
  }

  if (question.type === QUESTION_TYPE.OPEN_TEXT) {
    const maxLength = question.maxLength ?? 80;
    if (normalizedValue.length > maxLength) {
      throw new ApiError(
        400,
        `Answer must be at most ${maxLength} characters`,
      );
    }
    return;
  }

  const options = question.options ?? [];
  if (!options.includes(normalizedValue)) {
    throw new ApiError(400, "Invalid answer option");
  }
}

async function requireActiveParticipant(sessionId: string, userId: string) {
  const participant = await SessionParticipant.findOne({
    sessionId,
    userId,
    status: PARTICIPANT_STATUS.ACTIVE,
  }).exec();

  if (!participant) {
    throw new ApiError(403, "Only active participants can submit answers");
  }
}

async function requireAnswerableSession(sessionId: string) {
  const session = await Session.findById(sessionId).exec();
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  const doc = session as SessionDocument;

  if (doc.status !== SESSION_STATUS.LIVE) {
    throw new ApiError(400, "Session is not live");
  }

  if (doc.currentQuestionIndex < 0 || !doc.questionEndsAt) {
    throw new ApiError(400, "No active question");
  }

  if (!isWithinAnswerWindow(doc.questionEndsAt)) {
    throw new ApiError(400, "Answer window has closed");
  }

  return doc;
}

function isDuplicateKeyError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function submitAnswer(
  userId: string,
  sessionId: string,
  rawValue: string,
): Promise<SubmittedAnswer> {
  const session = await requireAnswerableSession(sessionId);
  await requireActiveParticipant(sessionId, userId);

  const index = session.currentQuestionIndex;
  const quiz = await Quiz.findById(session.quizId).select("questions").exec();
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  const question = quiz.questions[index] as QuestionSubdocument | undefined;
  if (!question) {
    throw new ApiError(400, "Question not found");
  }

  const value = normalizeAnswerValue(rawValue);
  validateAnswerValue(question, value);

  try {
    await Answer.create({
      sessionId,
      userId,
      questionId: question._id,
      questionIndex: index,
      questionType: question.type,
      value,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, "You have already answered this question");
    }
    throw error;
  }

  return {
    index,
    value,
    questionId: question._id.toString(),
  };
}

export async function getUserAnswerForQuestion(
  sessionId: string,
  userId: string,
  questionIndex: number,
): Promise<SubmittedAnswer | null> {
  const answer = await Answer.findOne({
    sessionId,
    userId,
    questionIndex,
  }).exec();

  if (!answer) {
    return null;
  }

  return {
    index: answer.questionIndex,
    value: answer.value,
    questionId: answer.questionId.toString(),
  };
}

export async function getUserAnswerForActiveQuestion(
  sessionId: string,
  userId: string,
): Promise<SubmittedAnswer | null> {
  const session = await Session.findById(sessionId).exec();
  if (!session || session.currentQuestionIndex < 0) {
    return null;
  }

  return getUserAnswerForQuestion(
    sessionId,
    userId,
    session.currentQuestionIndex,
  );
}
