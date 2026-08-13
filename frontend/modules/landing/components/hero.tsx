import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LivePreview } from "./live-preview";

export function Hero() {
  return (
    <section className="hero-glow relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
            Real-time quizzes & polling
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
            Questions live.
            <br />
            <span className="text-primary">Answers instant.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Host scored MCQs, quick polls, and open-text word clouds — all
            synced in real time. Your audience joins with a room code and
            competes on a live leaderboard.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
              Create a quiz
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/join" />}>
              Join with room code
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
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
