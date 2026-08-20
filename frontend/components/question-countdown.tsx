"use client";

import { useEffect, useRef, useState } from "react";

type QuestionCountdownProps = {
  endsAt: string;
  serverNow: string;
};

export function QuestionCountdown({ endsAt, serverNow }: QuestionCountdownProps) {
  const skewRef = useRef(Date.now() - new Date(serverNow).getTime());
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    skewRef.current = Date.now() - new Date(serverNow).getTime();

    function tick() {
      const now = Date.now() - skewRef.current;
      const remainingMs = new Date(endsAt).getTime() - now;
      setSecondsLeft(Math.max(0, Math.ceil(remainingMs / 1000)));
    }

    tick();
    const intervalId = setInterval(tick, 200);
    return () => clearInterval(intervalId);
  }, [endsAt, serverNow]);

  return (
    <p className="font-mono text-3xl font-bold tabular-nums text-primary">
      {secondsLeft}s
    </p>
  );
}
