import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { QUIZ_DURATION_MS, QUIZ_LIMITS } from "./quiz.constants.js";
import { questionSubdocumentSchema } from "./question.model.js";
import { QUIZ_STATUSES, QUIZ_STATUS } from "@/types/quiz.types.js";

const quizSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    title: {
      type: String,
      required: true,
      maxlength: QUIZ_LIMITS.titleMaxLength,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      maxlength: QUIZ_LIMITS.descriptionMaxLength,
      trim: true,
    },
    status: {
      type: String,
      enum: QUIZ_STATUSES,
      default: QUIZ_STATUS.DRAFT,
      required: true,
    },
    pointsPerQuestion: {
      type: Number,
      default: QUIZ_LIMITS.pointsPerQuestion.default,
      min: QUIZ_LIMITS.pointsPerQuestion.min,
      max: QUIZ_LIMITS.pointsPerQuestion.max,
    },
    durationPerQuestion: {
      type: Number,
      default: QUIZ_DURATION_MS.default,
      min: QUIZ_DURATION_MS.min,
      max: QUIZ_DURATION_MS.max,
    },
    questions: {
      type: [questionSubdocumentSchema],
      default: [],
    },
  },
  { timestamps: true },
);

quizSchema.index({ ownerId: 1, status: 1 });

export type QuizDocument = InferSchemaType<typeof quizSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Quiz = mongoose.model("Quiz", quizSchema);
