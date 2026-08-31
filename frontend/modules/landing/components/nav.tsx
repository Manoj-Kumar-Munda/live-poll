"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { authClient } from "@/lib/auth-client";
import { pathForRole } from "@/modules/auth/utils/helpers";

export function LandingNav() {
  const { data: session, isPending } = authClient.useSession();
  const appPath = pathForRole(session?.user.role);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
        aria-label="Main"
      >
        <BrandLogo />

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/join" />}
            className="hidden sm:inline-flex"
          >
            Join
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/quizzes" />}
          >
            Browse
          </Button>
          {isPending ? null : session?.user ? (
            <Button
              nativeButton={false}
              render={<Link href={appPath} />}
              className="rounded-full px-4"
            >
              {session.user.role === "host" ? "Dashboard" : "Home"}
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href="/login" />}
                className="hidden sm:inline-flex"
              >
                Log in
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/register" />}
                className="rounded-full px-4"
              >
                Sign up free
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
