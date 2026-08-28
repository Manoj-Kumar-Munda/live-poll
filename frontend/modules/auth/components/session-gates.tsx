"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getSession } from "@/modules/participant/api/sessions";
import { participantSessionKeys } from "@/modules/participant/api/session-keys";
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

type RequireParticipantOrGuestProps = {
  sessionId: string;
  children: React.ReactNode;
};

export function RequireParticipantOrGuest({
  sessionId,
  children,
}: RequireParticipantOrGuestProps) {
  const router = useRouter();
  const { data: authSession, isPending: authPending } = authClient.useSession();
  const isGuestProbe = !authPending && !authSession?.user;

  const {
    isLoading: guestLoading,
    isError: guestError,
    isSuccess: guestSuccess,
  } = useQuery({
    queryKey: participantSessionKeys.detail(sessionId),
    queryFn: () => getSession(sessionId),
    enabled: isGuestProbe,
    retry: false,
  });

  useEffect(() => {
    if (authPending) {
      return;
    }

    if (authSession?.user) {
      if (authSession.user.role !== "participant") {
        router.replace(pathForRole(authSession.user.role));
      }
      return;
    }

    if (!guestLoading && guestError) {
      router.replace("/quizzes");
    }
  }, [
    authPending,
    authSession,
    guestError,
    guestLoading,
    router,
  ]);

  if (authPending || (isGuestProbe && guestLoading)) {
    return (
      <main className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading...
      </main>
    );
  }

  if (authSession?.user?.role === "participant") {
    return children;
  }

  if (isGuestProbe && guestSuccess) {
    return children;
  }

  return null;
}
