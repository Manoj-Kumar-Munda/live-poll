"use client";

import {
  AnimatedWordRenderer,
  WordCloud,
  type WordCloudProps,
  type WordRendererData,
} from "@isoterik/react-word-cloud";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react";
import {
  computeOverflowScale,
  computeWordFontSize,
  WORD_CLOUD_MIN_SCALE,
} from "@/lib/word-cloud-sizing";
import type { WordCloudTerm } from "@/shared/types";

const CLOUD_HEIGHT = 300;

type WordCloudPanelProps = {
  terms: WordCloudTerm[];
  questionKey: string;
  mode?: "live" | "results";
  highlightedKey?: string | null;
  answerCount?: number;
};

export function WordCloudPanel({
  terms,
  questionKey,
  mode = "live",
  highlightedKey = null,
  answerCount,
}: WordCloudPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const knownKeysRef = useRef<Set<string>>(new Set());
  const [dimensions, setDimensions] = useState({ width: 0, height: CLOUD_HEIGHT });
  const [fitScale, setFitScale] = useState(1);
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set());
  const [pulseKey, setPulseKey] = useState<string | null>(null);
  const prevCountsRef = useRef<Map<string, number>>(new Map());

  const words = useMemo(
    () => terms.map((term) => ({ text: term.label, value: term.count })),
    [terms],
  );

  const counts = useMemo(() => terms.map((term) => term.count), [terms]);
  const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
  const minCount = counts.length > 0 ? Math.min(...counts) : 1;

  const labelToKey = useMemo(
    () => new Map(terms.map((term) => [term.label, term.key])),
    [terms],
  );

  useEffect(() => {
    knownKeysRef.current = new Set();
    prevCountsRef.current = new Map();
    setFitScale(1);
    setNewKeys(new Set());
    setPulseKey(null);
  }, [questionKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setDimensions({
        width: Math.floor(entry.contentRect.width),
        height: CLOUD_HEIGHT,
      });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const incomingNew = new Set<string>();

    for (const term of terms) {
      const previousCount = prevCountsRef.current.get(term.key) ?? 0;

      if (!knownKeysRef.current.has(term.key)) {
        knownKeysRef.current.add(term.key);
        incomingNew.add(term.key);
      } else if (previousCount > 0 && term.count > previousCount) {
        setPulseKey(term.key);
      }

      prevCountsRef.current.set(term.key, term.count);
    }

    if (incomingNew.size > 0) {
      setNewKeys(incomingNew);
      const timeoutId = window.setTimeout(() => setNewKeys(new Set()), 700);
      return () => window.clearTimeout(timeoutId);
    }
  }, [terms]);

  useEffect(() => {
    if (!pulseKey) {
      return;
    }

    const timeoutId = window.setTimeout(() => setPulseKey(null), 350);
    return () => window.clearTimeout(timeoutId);
  }, [pulseKey]);

  useLayoutEffect(() => {
    const svg =
      containerRef.current?.querySelector("svg") ?? svgRef.current;
    if (!svg || terms.length === 0 || dimensions.width === 0) {
      return;
    }

    try {
      if (!svg.isConnected) {
        return;
      }

      const bbox = svg.getBBox();
      const nextScale = computeOverflowScale(
        bbox.width,
        bbox.height,
        dimensions.width,
        dimensions.height,
        fitScale,
      );

      if (nextScale < fitScale - 0.01) {
        setFitScale(nextScale);
      }
    } catch {
      // Layout can throw before the SVG is painted; skip this frame.
    }
  }, [terms, dimensions, fitScale, words]);

  const fontSize = useCallback(
    (word: { text: string; value: number }) =>
      computeWordFontSize({
        count: word.value,
        minCount,
        maxCount,
        fitScale,
      }),
    [fitScale, maxCount, minCount],
  );

  const renderWord: WordCloudProps["renderWord"] = useCallback(
    (data: WordRendererData, ref?: Ref<SVGTextElement>) => {
      const key = labelToKey.get(data.text);
      const isHighlighted = key != null && key === highlightedKey;
      const isNew = key != null && newKeys.has(key);
      const isPulsing = key != null && key === pulseKey;

      return (
        <AnimatedWordRenderer
          ref={ref}
          data={data}
          animationDelay={isNew ? 0 : 0}
          textStyle={{
            fill: isHighlighted ? "var(--primary)" : "var(--foreground)",
            fontWeight: isHighlighted ? 700 : 600,
            transition: "font-size 300ms ease, fill 200ms ease, transform 300ms ease",
            transform: isPulsing ? "scale(1.12)" : undefined,
            transformBox: "fill-box",
            transformOrigin: "center",
          }}
        />
      );
    },
    [highlightedKey, labelToKey, newKeys, pulseKey],
  );

  const totalAnswers =
    answerCount ?? terms.reduce((total, term) => total + term.count, 0);

  return (
    <section className="mt-6 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {mode === "live" ? "Live word cloud" : "Word cloud results"}
        </p>
        {totalAnswers > 0 ? (
          <p className="text-xs text-text-secondary">
            {totalAnswers} {totalAnswers === 1 ? "answer" : "answers"}
          </p>
        ) : null}
      </div>

      <div
        ref={containerRef}
        className="relative mt-4 w-full overflow-hidden rounded-lg border border-dashed border-border bg-background"
        style={{ height: CLOUD_HEIGHT }}
      >
        {terms.length === 0 ? (
          <p className="flex h-full items-center justify-center px-6 text-center text-sm text-text-secondary">
            {mode === "live"
              ? "Answers will appear here as players respond…"
              : "No answers received."}
          </p>
        ) : dimensions.width > 0 ? (
          <WordCloud
            ref={svgRef}
            words={words}
            width={dimensions.width}
            height={dimensions.height}
            fontSize={fontSize}
            font="sans-serif"
            fontWeight="600"
            padding={3}
            spiral="archimedean"
            renderWord={renderWord}
            svgProps={{
              role: "img",
              "aria-label": "Word cloud of participant answers",
            }}
          />
        ) : null}
      </div>

      {fitScale < 0.99 && fitScale > WORD_CLOUD_MIN_SCALE ? (
        <p className="mt-2 text-xs text-text-muted">
          Scaled to fit {terms.length} responses.
        </p>
      ) : null}
    </section>
  );
}
