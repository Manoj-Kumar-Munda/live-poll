import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { SESSION_STATUSES, SESSION_STATUS } from "@/types/session.types.js";
import { SESSION_LIMITS } from "./session.constants.js";

const sessionSchema = new Schema(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    hostId: { type: String, required: true, index: true },
    roomCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: SESSION_LIMITS.roomCodeLength,
      maxlength: SESSION_LIMITS.roomCodeLength,
    },
    status: {
      type: String,
      enum: SESSION_STATUSES,
      default: SESSION_STATUS.WAITING,
      required: true,
    },
    currentQuestionIndex: { type: Number, default: -1 },
    questionEndsAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
    liveStartedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

sessionSchema.index({ hostId: 1, quizId: 1, status: 1 });
sessionSchema.index(
  { roomCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [SESSION_STATUS.WAITING, SESSION_STATUS.LIVE] },
    },
  },
);

export type SessionDocument = InferSchemaType<typeof sessionSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Session = mongoose.model("Session", sessionSchema);
