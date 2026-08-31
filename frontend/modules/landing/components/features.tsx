import {
  BarChart3,
  Clock,
  ClipboardCheck,
  MessageSquare,
  RefreshCw,
  Smartphone,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SectionIntro } from "@/components/marketing/section-intro";

const highlights: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Real-time results",
    description:
      "Votes and scores update live as people answer. Energy stays high and the room stays in sync.",
    icon: Zap,
  },
  {
    title: "Join from any device",
    description:
      "Participants enter a room code on their phone or laptop. No downloads, no accounts required to play.",
    icon: Smartphone,
  },
  {
    title: "Built for different questions",
    description:
      "MCQs for competition, polls for quick checks, open text for word clouds — each type shows the right results.",
    icon: BarChart3,
  },
];

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
      "One correct answer per question. Points land on the leaderboard when the timer ends.",
    icon: ClipboardCheck,
    accent: "text-signal",
    accentBg: "bg-signal/10",
  },
  {
    title: "Quick polls",
    description:
      "Yes/no or multi-option polls with instant percentage breakdowns. Zero scoring, pure signal.",
    icon: BarChart3,
    accent: "text-electric",
    accentBg: "bg-electric/10",
  },
  {
    title: "Open-text word clouds",
    description:
      "Collect short answers and reveal a shared word cloud when the question closes.",
    icon: MessageSquare,
    accent: "text-spotlight",
    accentBg: "bg-spotlight/10",
  },
  {
    title: "Live leaderboard",
    description:
      "Rankings update after each scored question and stay consistent on reconnect.",
    icon: Trophy,
    accent: "text-electric",
    accentBg: "bg-electric/10",
  },
  {
    title: "Server-synced timers",
    description:
      "Everyone sees the same countdown because the server sets when time runs out.",
    icon: Clock,
    accent: "text-spotlight",
    accentBg: "bg-spotlight/10",
  },
  {
    title: "Reconnect support",
    description:
      "Drop connection or refresh — pick up where you left off if time remains.",
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
        <SectionIntro
          eyebrow="Why LivePoll"
          title="Create polls people can answer instantly"
          description="Check understanding, spark discussion, or run a friendly competition — with results everyone sees at the same time."
          className="mb-12"
        />

        <div className="mb-14 grid gap-4 lg:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon size={22} strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="font-display text-lg font-semibold text-text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="stagger-item card-hover rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(23,26,43,0.04)]"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${feature.accentBg} ${feature.accent}`}
              >
                <feature.icon size={20} strokeWidth={1.75} aria-hidden />
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
