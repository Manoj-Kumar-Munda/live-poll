export const QUIZ_LIMITS = {
  titleMaxLength: 120,
  descriptionMaxLength: 2000,
  pointsPerQuestion: {
    min: 1,
    max: 1000,
    default: 10,
  },
  timeLimitSeconds: {
    min: 5,
    max: 300,
    default: 30,
  },
} as const;

/** Stored on the quiz document in milliseconds. */
export const QUIZ_DURATION_MS = {
  min: QUIZ_LIMITS.timeLimitSeconds.min * 1000,
  max: QUIZ_LIMITS.timeLimitSeconds.max * 1000,
  default: QUIZ_LIMITS.timeLimitSeconds.default * 1000,
} as const;

export const QUESTION_LIMITS = {
  promptMaxLength: 500,
  optionMaxLength: 120,
  mcqOptions: { min: 2, max: 4 },
  pollOptions: { min: 2, max: 6 },
  openTextMaxLength: { min: 1, max: 500, default: 80 },
} as const;
