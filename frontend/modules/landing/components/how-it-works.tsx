import { LineChart, Share2, Sparkles } from "lucide-react";
import { SectionIntro } from "@/components/marketing/section-intro";

const steps = [
  {
    title: "Ask a question",
    description:
      "Create a quiz, pick MCQ, poll, or open text, and publish when you are ready to go live.",
    icon: Sparkles,
  },
  {
    title: "Share the code",
    description:
      "Start a session and give your group the 6-character room code. They join from any device.",
    icon: Share2,
  },
  {
    title: "See results live",
    description:
      "Launch questions one by one. Percentages, word clouds, and leaderboard updates appear instantly.",
    icon: LineChart,
  },
];

export function HowItWorks() {
  return (
    <section
      className="marketing-band border-t border-border/60 py-16 sm:py-24"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionIntro
          id="how-heading"
          eyebrow="How it works"
          title="From question to live results in minutes"
          description="Hosts control the pace. Participants answer on their own screens. Everyone sees the same outcome when time is up."
          align="center"
          className="mb-12"
        />

        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(23,26,43,0.04)]"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon size={20} aria-hidden />
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums text-primary">
                  {index + 1}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
