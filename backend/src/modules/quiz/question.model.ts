import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { QUESTION_LIMITS } from "./quiz.constants.js";
import { QUESTION_TYPES } from "@/types/quiz.types.js";

export const questionSubdocumentSchema = new Schema(
  {
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
  { _id: true },
);

export type QuestionSubdocument = InferSchemaType<
  typeof questionSubdocumentSchema
> & {
  _id: mongoose.Types.ObjectId;
};
