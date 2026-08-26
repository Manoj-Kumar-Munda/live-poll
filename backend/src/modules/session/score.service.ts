import type { QuestionSubdocument } from "@/modules/quiz/question.model.js";
import { Quiz } from "@/modules/quiz/quiz.model.js";
import { QUESTION_TYPE } from "@/types/quiz.types.js";
import { Answer } from "./answer.model.js";
import { SessionParticipant } from "./participant.model.js";
import { Session, type SessionDocument } from "./session.model.js";

export async function scoreMcqQuestion(
  sessionId: string,
  questionIndex: number,
): Promise<number> {
  const session = await Session.findById(sessionId).exec();
  if (!session) {
    return 0;
  }

  const doc = session as SessionDocument;
  const quiz = await Quiz.findById(doc.quizId)
    .select("questions pointsPerQuestion")
    .exec();
  if (!quiz) {
    return 0;
  }

  const question = quiz.questions[questionIndex] as QuestionSubdocument | undefined;
  if (!question || question.type !== QUESTION_TYPE.MCQ || !question.correctAnswer) {
    return 0;
  }

  const correctAnswer = question.correctAnswer.toLowerCase();
  const answers = await Answer.find({ sessionId, questionIndex }).exec();
  const correctUserIds = answers
    .filter((answer) => answer.value === correctAnswer)
    .map((answer) => answer.userId);

  if (correctUserIds.length === 0) {
    return 0;
  }

  const points = quiz.pointsPerQuestion;

  await SessionParticipant.bulkWrite(
    correctUserIds.map((userId) => ({
      updateOne: {
        filter: { sessionId, userId },
        update: { $inc: { score: points } },
      },
    })),
  );

  return points;
}
