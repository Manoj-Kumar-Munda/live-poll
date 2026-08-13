"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { pathForRole } from "@/modules/auth/utils/helpers";

export function LandingNav() {
  const { data: session, isPending } = authClient.useSession();
  const appPath = pathForRole(session?.user.role);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8"
        aria-label="Main"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
            aria-hidden="true"
          >
            LP
          </span>
          LivePoll
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" nativeButton={false} render={<Link href="/quizzes" />} className="hidden sm:inline-flex">
            Browse quizzes
          </Button>
          {isPending ? null : session?.user ? (
            <Button nativeButton={false} render={<Link href={appPath} />}>
              {session.user.role === "host" ? "Dashboard" : "Home"}
            </Button>
          ) : (
            <>
              <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
                Log in
              </Button>
              <Button nativeButton={false} render={<Link href="/register" />}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
