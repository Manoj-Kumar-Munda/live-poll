import {
  BarChart3,
  Clock,
  ClipboardCheck,
  MessageSquare,
  RefreshCw,
  Trophy,
  type LucideIcon,
} from "lucide-react";

const features: {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  accentBg: string;
}[] = [
  {
    title: "Scored MCQs",
    description:
      "Multiple choice with one correct answer. Points update on the leaderboard after each question.",
    icon: ClipboardCheck,
    accent: "text-signal",
    accentBg: "bg-signal/10",
  },
  {
    title: "Yes / No polls",
    description:
      "Quick engagement checks with instant percentage breakdowns. No scoring — pure signal.",
    icon: BarChart3,
    accent: "text-electric",
    accentBg: "bg-electric/10",
  },
  {
    title: "Open-text word clouds",
    description:
      "Collect free-text responses and reveal a live word cloud when the timer ends.",
    icon: MessageSquare,
    accent: "text-spotlight",
    accentBg: "bg-spotlight/10",
  },
  {
    title: "Live leaderboard",
    description:
      "Scores batch-update when each question ends. Rankings stay consistent even on reconnect.",
    icon: Trophy,
    accent: "text-electric",
    accentBg: "bg-electric/10",
  },
  {
    title: "Server-synced timers",
    description:
      "Countdowns use server timestamps so every participant sees the same remaining time.",
    icon: Clock,
    accent: "text-spotlight",
    accentBg: "bg-spotlight/10",
  },
  {
    title: "Reconnect support",
    description:
      "Refresh or drop connection — resume from current state and submit if time remains.",
    icon: RefreshCw,
    accent: "text-signal",
    accentBg: "bg-signal/10",
  },
];

export function Features() {
  return (
    <section
      className="border-t border-border/60 py-16 sm:py-24"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <h2
            id="features-heading"
            className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
          >
            Three question types. One live room.
          </h2>
          <p className="mt-3 text-text-secondary">
            MCQs compete for points. Polls and open text capture engagement
            without scoring. Results appear the moment the timer stops.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="stagger-item card-hover rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04)]"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${feature.accentBg} ${feature.accent}`}
              >
                <feature.icon size={22} strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="font-display text-base font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
