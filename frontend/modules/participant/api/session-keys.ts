export const participantSessionKeys = {
  all: ["participant-sessions"] as const,
  detail: (id: string) => [...participantSessionKeys.all, id] as const,
};
