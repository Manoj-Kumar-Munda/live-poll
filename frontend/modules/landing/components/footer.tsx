import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
        <p className="text-sm text-text-muted">
          © {new Date().getFullYear()} LivePoll
        </p>
        <div className="flex items-center gap-6 text-sm text-text-secondary">
          <Link
            href="/login"
            className="pressable transition-colors duration-200 hover:text-text-primary"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="pressable transition-colors duration-200 hover:text-text-primary"
          >
            Sign up
          </Link>
          <Link
            href="/quizzes"
            className="pressable transition-colors duration-200 hover:text-text-primary"
          >
            Browse quizzes
          </Link>
        </div>
      </div>
    </footer>
  );
}
