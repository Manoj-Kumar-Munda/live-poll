import { Monitor, Users } from "lucide-react";

const hostSteps = [
  "Create a quiz and add questions",
  "Publish and start a session",
  "Share the room code",
  "Launch questions and control the flow",
];

const participantSteps = [
  "Enter the room code",
  "Wait in the lobby until the host starts",
  "Answer within the countdown",
  "See results and your rank",
];

export function HowItWorks() {
  return (
    <section
      className="border-t border-border/60 py-16 sm:py-24"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2
          id="how-heading"
          className="mb-12 font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
        >
          Two roles. One session.
        </h2>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-electric/15 text-electric"
                aria-hidden="true"
              >
                <Monitor size={18} aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  Host
                </h3>
                <p className="text-sm text-text-muted">Create and control</p>
              </div>
            </div>
            <ol className="space-y-4">
              {hostSteps.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span
                    className="font-mono text-sm tabular-nums text-electric"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-text-secondary">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-spotlight/15 text-spotlight"
                aria-hidden="true"
              >
                <Users size={18} aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  Participant
                </h3>
                <p className="text-sm text-text-muted">Join and compete</p>
              </div>
            </div>
            <ol className="space-y-4">
              {participantSteps.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span
                    className="font-mono text-sm tabular-nums text-spotlight"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-text-secondary">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
