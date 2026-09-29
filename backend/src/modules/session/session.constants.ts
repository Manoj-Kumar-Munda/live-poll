const SESSION_LIMITS = {
  roomCodeLength: 6,
  maxActiveHours: 4,
  /** Grace window for in-flight answer packets after `questionEndsAt`. */
  answerGraceMs: 400,
} as const;

/** Excludes ambiguous characters (0/O, 1/I). */
const ROOM_CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function isWithinAnswerWindow(endsAt: Date, now = Date.now()) {
  return now <= endsAt.getTime() + SESSION_LIMITS.answerGraceMs;
}

function isQuestionTimerActive(endsAt: Date | null, now = Date.now()) {
  return endsAt !== null && now < endsAt.getTime();
}

export { SESSION_LIMITS, ROOM_CODE_CHARS, isWithinAnswerWindow, isQuestionTimerActive };
