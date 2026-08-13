"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { pathForRole } from "../utils/helpers";

export function RedirectIfAuthenticated() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending || !session?.user) {
      return;
    }

    router.replace(pathForRole(session.user.role));
  }, [isPending, router, session]);

  return null;
}

type RequireAuthProps = {
  role?: "host" | "participant";
  children: React.ReactNode;
};

export function RequireAuth({ role, children }: RequireAuthProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (role && session.user.role !== role) {
      router.replace(pathForRole(session.user.role));
    }
  }, [isPending, role, router, session]);

  if (isPending || !session?.user) {
    return (
      <main className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading...
      </main>
    );
  }

  if (role && session.user.role !== role) {
    return null;
  }

  return children;
}
