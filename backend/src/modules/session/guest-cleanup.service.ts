import { Answer } from "./answer.model.js";
import { SessionParticipant } from "./participant.model.js";
import { isGuestUserId } from "@/modules/auth/guest-auth.js";

export async function purgeGuestSessionData(sessionId: string) {
  const guestParticipants = await SessionParticipant.find({
    sessionId,
    userId: { $regex: "^guest:" },
  })
    .select("userId")
    .lean()
    .exec();

  const guestUserIds = guestParticipants.map((participant) => participant.userId);

  if (guestUserIds.length === 0) {
    return;
  }

  await Promise.all([
    Answer.deleteMany({ sessionId, userId: { $in: guestUserIds } }).exec(),
    SessionParticipant.deleteMany({
      sessionId,
      userId: { $in: guestUserIds },
    }).exec(),
  ]);
}

export function isGuestParticipantUserId(userId: string) {
  return isGuestUserId(userId);
}
