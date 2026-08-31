import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <BrandLogo />
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Real-time quizzes and polling for team events, classrooms, and
            pub-style rounds.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <div>
            <p className="font-medium text-text-primary">Play</p>
            <div className="mt-3 flex flex-col gap-2 text-text-secondary">
              <Link href="/join" className="hover:text-primary">
                Join with code
              </Link>
              <Link href="/quizzes" className="hover:text-primary">
                Browse quizzes
              </Link>
            </div>
          </div>
          <div>
            <p className="font-medium text-text-primary">Account</p>
            <div className="mt-3 flex flex-col gap-2 text-text-secondary">
              <Link href="/login" className="hover:text-primary">
                Log in
              </Link>
              <Link href="/register" className="hover:text-primary">
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-6xl px-5 text-sm text-text-muted sm:px-8">
        © {new Date().getFullYear()} LivePoll
      </p>
    </footer>
  );
}
