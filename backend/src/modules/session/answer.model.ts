import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { QUESTION_TYPES } from "@/types/quiz.types.js";

const answerSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    userId: { type: String, required: true, index: true, ref: "User" },
    questionId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "Question",
    },
    questionIndex: { type: Number, required: true, min: 0 },
    questionType: {
      type: String,
      enum: QUESTION_TYPES,
      required: true,
    },
    value: { type: String, required: true, trim: true },
    submittedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

answerSchema.index({ sessionId: 1, userId: 1, questionId: 1 }, { unique: true });

export type AnswerDocument = InferSchemaType<typeof answerSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Answer = mongoose.model("Answer", answerSchema);
