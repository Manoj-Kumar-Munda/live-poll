import Link from "next/link";
import { ButtonLink } from "@/shared/components/ui/button-link";

export function CtaSection() {
  return (
    <section className="border-t border-border/60 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div
          className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-12 text-center sm:px-12 sm:py-16"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,142,247,0.08)_0%,transparent_70%)]"
            aria-hidden="true"
          />

          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Ready to run your first live session?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-text-secondary">
            Browse quizzes happening now, or create your own and share a room
            code in seconds.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/auth/register">Get started free</ButtonLink>
            <Link
              href="/quizzes"
              className="pressable text-sm text-text-secondary transition-colors duration-200 hover:text-electric"
            >
              Browse live quizzes →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
