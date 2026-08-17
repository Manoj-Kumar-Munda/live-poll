export const SESSION_LIMITS = {
  roomCodeLength: 6,
  maxActiveHours: 4,
} as const;

/** Excludes ambiguous characters (0/O, 1/I). */
export const ROOM_CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
