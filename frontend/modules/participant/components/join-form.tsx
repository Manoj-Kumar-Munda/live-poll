"use client";

import { authClient } from "@/lib/auth-client";
import { GuestJoinForm } from "./guest-join-form";
import { JoinSessionForm } from "./join-session-form";

type JoinFormProps = {
  className?: string;
  submitLabel?: string;
};

export function JoinForm({ className, submitLabel }: JoinFormProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Loading...</p>
    );
  }

  if (session?.user?.role === "participant") {
    return (
      <JoinSessionForm
        className={className}
        submitLabel={submitLabel}
      />
    );
  }

  return (
    <GuestJoinForm
      className={className}
      submitLabel={submitLabel}
    />
  );
}
