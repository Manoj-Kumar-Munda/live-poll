"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { applyApiErrorsToForm } from "@/lib/errors";
import { useJoinSession } from "../api/use-sessions";
import { RoomCodeField } from "./room-code-field";

const joinSchema = z.object({
  roomCode: z
    .string()
    .trim()
    .toUpperCase()
    .length(6, "Room code must be 6 characters"),
});

type JoinValues = z.infer<typeof joinSchema>;

type JoinSessionFormProps = {
  className?: string;
  submitLabel?: string;
};

export function JoinSessionForm({
  className,
  submitLabel = "Join session",
}: JoinSessionFormProps) {
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
    <form
      className={className}
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
    >
      <FieldGroup>
        <RoomCodeField
          error={form.formState.errors.roomCode}
          registration={form.register("roomCode")}
        />
      </FieldGroup>

      <Button
        type="submit"
        className="mt-4 w-full rounded-full"
        disabled={form.formState.isSubmitting || joinSession.isPending}
      >
        {joinSession.isPending ? "Joining..." : submitLabel}
      </Button>
    </form>
  );
}
