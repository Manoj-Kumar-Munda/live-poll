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
    email: { type: String, default: null, trim: true, maxlength: 254 },
    isGuest: { type: Boolean, default: false, required: true },
    displayName: { type: String, required: true, trim: true, maxlength: 100 },
    status: {
      type: String,
      enum: PARTICIPANT_STATUSES,
      default: PARTICIPANT_STATUS.ACTIVE,
      required: true,
    },
    score: { type: Number, default: 0, min: 0 },
    finalRank: { type: Number, default: null, min: 1 },
    joinedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

sessionParticipantSchema.index({ sessionId: 1, userId: 1 }, { unique: true });
sessionParticipantSchema.index({ sessionId: 1, status: 1 });

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
