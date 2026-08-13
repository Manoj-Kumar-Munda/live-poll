import { ButtonLink } from "@/shared/components/ui/button-link";
import { LivePreview } from "./live-preview";

export function Hero() {
  return (
    <section className="hero-glow relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-electric">
            Real-time quizzes & polling
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-[3.25rem]">
            Questions live.
            <br />
            <span className="text-electric">Answers instant.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">
            Host scored MCQs, quick polls, and open-text word clouds — all
            synced in real time. Your audience joins with a room code and
            competes on a live leaderboard.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/auth/register">
              Create a quiz
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </ButtonLink>
            <ButtonLink href="/join" variant="secondary">
              Join with room code
            </ButtonLink>
          </div>

          <p className="mt-4 text-sm text-text-muted">
            Free to start. No credit card required.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <LivePreview />
        </div>
      </div>
    </section>
  );
}
