"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type OptionResultRowProps = {
  option: string;
  percent: number;
  variant: "poll" | "mcq-correct" | "mcq-default";
  isYourAnswer?: boolean;
};

export function OptionResultRow({
  option,
  percent,
  variant,
  isYourAnswer = false,
}: OptionResultRowProps) {
  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setFillWidth(percent));
    return () => cancelAnimationFrame(frameId);
  }, [percent]);

  const fillClass =
    variant === "mcq-correct"
      ? "bg-signal/30"
      : variant === "poll"
        ? "bg-primary/25"
        : "bg-primary/15";

  return (
    <li
      className={cn(
        "relative w-full overflow-hidden rounded-lg border bg-background",
        variant === "mcq-correct" ? "border-signal/50" : "border-border",
        isYourAnswer && "ring-2 ring-primary/40 ring-offset-1",
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 transition-[width] duration-700 ease-out",
          fillClass,
        )}
        style={{ width: `${fillWidth}%` }}
        aria-hidden
      />
      <div className="relative flex w-full items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="font-medium">{option}</span>
        <span className="shrink-0 tabular-nums text-text-secondary">
          {percent}%
        </span>
      </div>
    </li>
  );
}
