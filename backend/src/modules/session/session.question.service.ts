import { Quiz } from "@/modules/quiz/quiz.model.js";
import type { QuestionSubdocument } from "@/modules/quiz/question.model.js";
import { QUESTION_TYPE } from "@/types/quiz.types.js";
import { SESSION_STATUS } from "@/types/session.types.js";
import { ApiError } from "@/shared/utils/api-error.js";
import { Session, type SessionDocument } from "./session.model.js";
import { isQuestionTimerActive } from "./session.constants.js";
import type {
  LiveQuestion,
  QuestionEndedPayload,
  QuestionStartedPayload,
} from "./session.types.js";

async function requireLiveSession(sessionId: string) {
  const session = await Session.findById(sessionId).exec();
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.status !== SESSION_STATUS.LIVE) {
    throw new ApiError(400, "Questions can only run during a live session");
  }

  return session as SessionDocument;
}

async function requireQuizQuestions(quizId: string) {
  const quiz = await Quiz.findById(quizId).select("questions durationPerQuestion").exec();
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  return quiz;
}

function toLiveQuestion(
  question: QuestionSubdocument,
  order: number,
): LiveQuestion {
  const base: LiveQuestion = {
    id: question._id.toString(),
    type: question.type,
    prompt: question.prompt,
    order,
  };

  if (question.type === QUESTION_TYPE.MCQ && question.options) {
    base.options = question.options;
  }

  if (question.type === QUESTION_TYPE.POLL && question.options) {
    base.options = question.options;
  }

  if (question.type === QUESTION_TYPE.OPEN_TEXT && question.maxLength != null) {
    base.maxLength = question.maxLength;
  }

  return base;
}

function buildStartedPayload(
  session: SessionDocument,
  index: number,
  question: LiveQuestion,
  endsAt: Date,
): QuestionStartedPayload {
  const serverNow = new Date();

  return {
    sessionId: session._id.toString(),
    index,
    question,
    endsAt: endsAt.toISOString(),
    serverNow: serverNow.toISOString(),
  };
}

export async function getActiveQuestionPayload(
  sessionId: string,
): Promise<QuestionStartedPayload | null> {
  const session = await Session.findById(sessionId).exec();
  if (!session) {
    return null;
  }

  const doc = session as SessionDocument;
  if (
    doc.currentQuestionIndex < 0 ||
    !isQuestionTimerActive(doc.questionEndsAt ?? null)
  ) {
    return null;
  }

  const quiz = await requireQuizQuestions(doc.quizId.toString());
  const question = quiz.questions[doc.currentQuestionIndex] as
    | QuestionSubdocument
    | undefined;

  if (!question) {
    return null;
  }

  return buildStartedPayload(
    doc,
    doc.currentQuestionIndex,
    toLiveQuestion(question, doc.currentQuestionIndex),
    doc.questionEndsAt!,
  );
}

export async function launchNextQuestion(
  hostId: string,
  sessionId: string,
): Promise<QuestionStartedPayload> {
  const session = await requireLiveSession(sessionId);

  if (session.hostId !== hostId) {
    throw new ApiError(403, "Only the host can launch questions");
  }

  if (isQuestionTimerActive(session.questionEndsAt ?? null)) {
    throw new ApiError(400, "Wait for the current question to finish");
  }

  const nextIndex = session.currentQuestionIndex + 1;
  const quiz = await requireQuizQuestions(session.quizId.toString());

  if (nextIndex >= quiz.questions.length) {
    throw new ApiError(400, "No more questions in this quiz");
  }

  const question = quiz.questions[nextIndex] as QuestionSubdocument;
  const endsAt = new Date(Date.now() + quiz.durationPerQuestion);

  const updated = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      hostId,
      status: SESSION_STATUS.LIVE,
      $or: [
        { questionEndsAt: null },
        { questionEndsAt: { $lte: new Date() } },
      ],
    },
    {
      $set: {
        currentQuestionIndex: nextIndex,
        questionEndsAt: endsAt,
      },
    },
    { new: true, runValidators: true },
  ).exec();

  if (!updated) {
    throw new ApiError(400, "Could not launch question");
  }

  return buildStartedPayload(
    updated as SessionDocument,
    nextIndex,
    toLiveQuestion(question, nextIndex),
    endsAt,
  );
}

export async function endCurrentQuestion(
  sessionId: string,
  reason: QuestionEndedPayload["reason"],
): Promise<QuestionEndedPayload> {
  const session = await requireLiveSession(sessionId);

  if (session.currentQuestionIndex < 0 || !session.questionEndsAt) {
    throw new ApiError(400, "No active question to end");
  }

  const index = session.currentQuestionIndex;

  const updated = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      status: SESSION_STATUS.LIVE,
      currentQuestionIndex: index,
      questionEndsAt: { $ne: null },
    },
    { $set: { questionEndsAt: null } },
    { new: true, runValidators: true },
  ).exec();

  if (!updated) {
    throw new ApiError(400, "No active question to end");
  }

  return {
    sessionId,
    index,
    reason,
  };
}
