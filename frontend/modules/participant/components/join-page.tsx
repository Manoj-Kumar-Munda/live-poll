"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { applyApiErrorsToForm } from "@/lib/errors";
import { useJoinSession } from "../api/use-sessions";

const joinSchema = z.object({
  roomCode: z
    .string()
    .trim()
    .toUpperCase()
    .length(6, "Room code must be 6 characters"),
});

type JoinValues = z.infer<typeof joinSchema>;

export function JoinPage() {
  const router = useRouter();
  const joinSession = useJoinSession();

  const form = useForm<JoinValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: { roomCode: "" },
  });

  async function handleSubmit(values: JoinValues) {
    try {
      const session = await joinSession.mutateAsync(values.roomCode);
      router.push(`/session/${session.id}`);
    } catch (error) {
      applyApiErrorsToForm(error, form.setError);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Join a session
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Enter the room code from your host to join the waiting room.
          </p>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.roomCode}>
              <FieldLabel htmlFor="room-code">Room code</FieldLabel>
              <Input
                id="room-code"
                placeholder="ABCDEF"
                autoComplete="off"
                className="text-center font-mono text-lg tracking-[0.3em] uppercase"
                maxLength={6}
                aria-invalid={!!form.formState.errors.roomCode}
                {...form.register("roomCode")}
              />
              <FieldError errors={[form.formState.errors.roomCode]} />
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting || joinSession.isPending}
          >
            {joinSession.isPending ? "Joining..." : "Join session"}
          </Button>
        </form>
      </div>
    </main>
  );
}
