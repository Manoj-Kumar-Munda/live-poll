export const USER_ROLES = ["host", "participant"] as const;

export type UserRole = (typeof USER_ROLES)[number];