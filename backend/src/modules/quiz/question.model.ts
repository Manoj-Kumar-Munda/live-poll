import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { QUESTION_LIMITS } from "./quiz.constants.js";
import { QUESTION_TYPES } from "@/types/quiz.types.js";

const questionSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    prompt: {
      type: String,
      required: true,
      maxlength: QUESTION_LIMITS.promptMaxLength,
      trim: true,
    },
    type: {
      type: String,
      enum: QUESTION_TYPES,
      required: true,
    },
    options: {
      type: [String],
      default: undefined,
    },
    correctAnswer: {
      type: String,
      default: undefined,
    },
    maxLength: {
      type: Number,
      min: QUESTION_LIMITS.openTextMaxLength.min,
      max: QUESTION_LIMITS.openTextMaxLength.max,
      default: undefined,
    },
  },
  { timestamps: true },
);

export type QuestionDocument = InferSchemaType<typeof questionSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Question = mongoose.model("Question", questionSchema);
