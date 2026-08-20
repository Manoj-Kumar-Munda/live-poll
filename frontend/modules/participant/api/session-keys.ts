export const participantSessionKeys = {
  all: ["participant-sessions"] as const,
  mine: () => [...participantSessionKeys.all, "mine"] as const,
  detail: (id: string) => [...participantSessionKeys.all, id] as const,
};
