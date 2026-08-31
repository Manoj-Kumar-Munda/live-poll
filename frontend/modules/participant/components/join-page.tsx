"use client";

import { Suspense } from "react";
import { LandingNav } from "@/modules/landing/components/nav";
import { LandingFooter } from "@/modules/landing/components/footer";
import { JoinForm } from "./join-form";

export function JoinPage() {
  return (
    <>
      <LandingNav />
      <main className="hero-glow min-h-svh flex  flex-col">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-16 sm:px-8">
          <div className="my-4">
            <h1 className="font-display text-lg font-bold tracking-tight text-text-primary sm:text-4xl">
             Join the event
            </h1>
            <p className="text-sm leading-relaxed text-text-secondary">
              Enter the event code to join the event.
            </p>
          </div>

          <div className="join-card rounded-2xl p-6 sm:p-8">
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">Loading...</p>
              }
            >
              <JoinForm />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
