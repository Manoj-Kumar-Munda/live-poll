const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function scheduleQuestionEnd(
  sessionId: string,
  endsAt: Date,
  onEnd: () => void | Promise<void>,
) {
  clearQuestionTimer(sessionId);

  const delayMs = endsAt.getTime() - Date.now();
  if (delayMs <= 0) {
    void onEnd();
    return;
  }

  timers.set(
    sessionId,
    setTimeout(() => {
      timers.delete(sessionId);
      void onEnd();
    }, delayMs),
  );
}

export function clearQuestionTimer(sessionId: string) {
  const timer = timers.get(sessionId);
  if (timer) {
    clearTimeout(timer);
  }
  timers.delete(sessionId);
}
