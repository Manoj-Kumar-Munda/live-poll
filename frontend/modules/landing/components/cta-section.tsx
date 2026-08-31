import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="border-t border-border/60 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.16),transparent_50%)]"
            aria-hidden="true"
          />

          <h2 className="relative font-display text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
            Ready to run your first live session?
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-primary-foreground/80">
            Create a quiz in minutes, share a room code, and watch answers roll
            in from every device in the room.
          </p>

          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="rounded-full bg-background px-6 text-primary hover:bg-muted"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Get started free
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              nativeButton={false}
              render={<Link href="/quizzes" />}
            >
              Browse live quizzes →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
