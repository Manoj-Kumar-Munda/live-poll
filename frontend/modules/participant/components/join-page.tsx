"use client";

import { JoinForm } from "./join-form";

export function JoinPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Join a session
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Enter the room code from your host to join the session.
          </p>
        </div>

        <JoinForm className="mt-8" />
      </div>
    </main>
  );
}
