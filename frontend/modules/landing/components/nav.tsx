import Link from "next/link";
import { ButtonLink } from "@/shared/components/ui/button-link";

export function LandingNav() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-stage/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8"
        aria-label="Main"
      >
        <Link
          href="/"
          className="pressable flex items-center gap-2 font-display text-lg font-bold tracking-tight"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md bg-electric text-xs font-bold text-white"
            aria-hidden="true"
          >
            LP
          </span>
          LivePoll
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/quizzes"
            className="pressable hidden rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors duration-200 sm:inline-flex hover:text-text-primary"
          >
            Browse quizzes
          </Link>
          <Link
            href="/auth/login"
            className="pressable rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors duration-200 hover:text-text-primary"
          >
            Log in
          </Link>
          <ButtonLink href="/auth/register" className="px-4 py-2">
            Sign up
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
