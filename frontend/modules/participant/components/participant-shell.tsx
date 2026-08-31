"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function ParticipantShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function signOut() {
    await authClient.signOut();
    router.replace("/");
  }

  return (
    <div className="min-h-svh bg-stage">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-6">
            <BrandLogo href="/home" />
            <nav
              className="hidden items-center gap-1 sm:flex"
              aria-label="Participant"
            >
              <NavLink href="/home" active={pathname === "/home"}>
                Home
              </NavLink>
              <NavLink href="/join" active={pathname === "/join"}>
                Join
              </NavLink>
              <NavLink href="/quizzes" active={pathname === "/quizzes"}>
                Browse
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden max-w-40 truncate text-sm text-text-secondary sm:block">
              {session?.user.name}
            </p>
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-text-secondary hover:bg-muted hover:text-text-primary",
      )}
    >
      {children}
    </Link>
  );
}
