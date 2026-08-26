import type { QuestionSubdocument } from "@/modules/quiz/question.model.js";
import { Quiz } from "@/modules/quiz/quiz.model.js";
import { QUESTION_TYPE } from "@/types/quiz.types.js";
import { ApiError } from "@/shared/utils/api-error.js";
import { Answer } from "./answer.model.js";
import { Session, type SessionDocument } from "./session.model.js";
import type {
  LiveQuestion,
  OptionResult,
  QuestionResultsPayload,
  WordResult,
} from "./session.types.js";
import {
  aggregateOpenTextResultsFromDb,
  getWordCloudSnapshot,
  toWordResults,
} from "./wordcloud.service.js";

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

  if (
    (question.type === QUESTION_TYPE.MCQ || question.type === QUESTION_TYPE.POLL) &&
    question.options
  ) {
    base.options = question.options;
  }

  if (question.type === QUESTION_TYPE.OPEN_TEXT && question.maxLength != null) {
    base.maxLength = question.maxLength;
  }

  return base;
}

function buildOptionResults(
  options: string[],
  countsByValue: Map<string, number>,
  totalAnswers: number,
): OptionResult[] {
  return options.map((option) => {
    const count = countsByValue.get(option.toLowerCase()) ?? 0;
    const percent =
      totalAnswers === 0 ? 0 : Math.round((count / totalAnswers) * 100);

    return { option, count, percent };
  });
}

async function buildOpenTextResults(
  sessionId: string,
  questionIndex: number,
  question: QuestionSubdocument,
): Promise<QuestionResultsPayload> {
  const snapshot = getWordCloudSnapshot(sessionId, questionIndex);
  let wordResults: WordResult[];

  if (snapshot.length > 0) {
    wordResults = toWordResults(snapshot);
  } else {
    wordResults = await aggregateOpenTextResultsFromDb(sessionId, questionIndex);
  }

  const totalAnswers = wordResults.reduce((total, term) => total + term.count, 0);

  return {
    sessionId,
    index: questionIndex,
    question: toLiveQuestion(question, questionIndex),
    wordResults,
    totalAnswers,
  };
}

async function buildChoiceResults(
  sessionId: string,
  questionIndex: number,
  question: QuestionSubdocument,
): Promise<QuestionResultsPayload> {
  const options = question.options ?? [];
  if (options.length === 0) {
    throw new ApiError(400, "Question has no options");
  }

  const answers = await Answer.find({ sessionId, questionIndex }).exec();
  const countsByValue = new Map<string, number>();

  for (const answer of answers) {
    const key = answer.value.toLowerCase();
    countsByValue.set(key, (countsByValue.get(key) ?? 0) + 1);
  }

  const totalAnswers = answers.length;
  const liveQuestion = toLiveQuestion(question, questionIndex);
  const optionResults = buildOptionResults(options, countsByValue, totalAnswers);

  const payload: QuestionResultsPayload = {
    sessionId,
    index: questionIndex,
    question: liveQuestion,
    optionResults,
    totalAnswers,
  };

  if (question.type === QUESTION_TYPE.MCQ && question.correctAnswer) {
    payload.correctAnswer = question.correctAnswer;
  }

  return payload;
}

export async function buildQuestionResults(
  sessionId: string,
  questionIndex: number,
): Promise<QuestionResultsPayload | null> {
  const session = await Session.findById(sessionId).exec();
  if (!session) {
    return null;
  }

  const doc = session as SessionDocument;
  if (questionIndex < 0 || questionIndex !== doc.currentQuestionIndex) {
    return null;
  }

  const quiz = await Quiz.findById(doc.quizId).select("questions").exec();
  if (!quiz) {
    return null;
  }

  const question = quiz.questions[questionIndex] as QuestionSubdocument | undefined;
  if (!question) {
    return null;
  }

  if (question.type === QUESTION_TYPE.OPEN_TEXT) {
    return buildOpenTextResults(sessionId, questionIndex, question);
  }

  if (
    question.type !== QUESTION_TYPE.MCQ &&
    question.type !== QUESTION_TYPE.POLL
  ) {
    return null;
  }

  return buildChoiceResults(sessionId, questionIndex, question);
}
