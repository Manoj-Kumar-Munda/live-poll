export const SESSION_STATUS = {
  WAITING: "WAITING",
  LIVE: "LIVE",
  FINISHED: "FINISHED",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

export const SESSION_STATUSES = Object.values(
  SESSION_STATUS,
) as SessionStatus[];
