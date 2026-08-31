import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LivePreview } from "./live-preview";

export function Hero() {
  return (
    <section className="hero-glow relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div>
          <p className="mb-4 inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            Live polling & quizzes
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.35rem]">
            Turn your group into
            <span className="text-primary"> active participants</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Collect answers in real time with scored MCQs, quick polls, and open-text
            word clouds. Share a room code — people join from any device, no install.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="rounded-full px-6"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Create a quiz — it&apos;s free
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-6"
              nativeButton={false}
              render={<Link href="/join" />}
            >
              Join with room code
            </Button>
          </div>

          <p className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone size={16} aria-hidden className="text-primary" />
            Phone, tablet, or laptop — answers appear instantly for everyone.
          </p>
        </div>
      </div>
    </section>
  );
}
