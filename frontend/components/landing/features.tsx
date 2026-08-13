const features = [
  {
    title: "Scored MCQs",
    description:
      "Multiple choice with one correct answer. Points update on the leaderboard after each question.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    accent: "text-signal",
    accentBg: "bg-signal/10",
  },
  {
    title: "Yes / No polls",
    description:
      "Quick engagement checks with instant percentage breakdowns. No scoring — pure signal.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
    accent: "text-electric",
    accentBg: "bg-electric/10",
  },
  {
    title: "Open-text word clouds",
    description:
      "Collect free-text responses and reveal a live word cloud when the timer ends.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    accent: "text-spotlight",
    accentBg: "bg-spotlight/10",
  },
  {
    title: "Live leaderboard",
    description:
      "Scores batch-update when each question ends. Rankings stay consistent even on reconnect.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1h-4.06c-.54 0-.97-.45-.97-1v-2.34" />
        <path d="M14 9.34V17c0 .55.47.98.97 1h4.06c.54 0 .97-.45.97-1V9.34" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
    accent: "text-electric",
    accentBg: "bg-electric/10",
  },
  {
    title: "Server-synced timers",
    description:
      "Countdowns use server timestamps so every participant sees the same remaining time.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    accent: "text-spotlight",
    accentBg: "bg-spotlight/10",
  },
  {
    title: "Reconnect support",
    description:
      "Refresh or drop connection — resume from current state and submit if time remains.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <polyline points="21 3 21 9 15 9" />
      </svg>
    ),
    accent: "text-signal",
    accentBg: "bg-signal/10",
  },
];

export function Features() {
  return (
    <section className="border-t border-border/60 py-16 sm:py-24" aria-labelledby="features-heading">
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
              className="stagger-item card-hover rounded-xl border border-border bg-surface p-5"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${feature.accentBg} ${feature.accent}`}
              >
                {feature.icon}
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
