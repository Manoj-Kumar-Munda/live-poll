import mongoose, { Schema, type InferSchemaType } from "mongoose";
import {
  PARTICIPANT_STATUSES,
  PARTICIPANT_STATUS,
} from "@/types/quiz.types.js";

const sessionParticipantSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    userId: { type: String, required: true, index: true },
    displayName: { type: String, required: true, trim: true, maxlength: 100 },
    status: {
      type: String,
      enum: PARTICIPANT_STATUSES,
      default: PARTICIPANT_STATUS.ACTIVE,
      required: true,
    },
    score: { type: Number, default: 0, min: 0 },
    joinedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

sessionParticipantSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

export type SessionParticipantDocument = InferSchemaType<
  typeof sessionParticipantSchema
> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SessionParticipant = mongoose.model(
  "SessionParticipant",
  sessionParticipantSchema,
);
