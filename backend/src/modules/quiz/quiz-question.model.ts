import mongoose, { Schema, type InferSchemaType } from "mongoose";

const quizQuestionSchema = new Schema(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    order: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

quizQuestionSchema.index({ quizId: 1, order: 1 }, { unique: true });
quizQuestionSchema.index({ quizId: 1, questionId: 1 }, { unique: true });

export type QuizQuestionDocument = InferSchemaType<typeof quizQuestionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);
