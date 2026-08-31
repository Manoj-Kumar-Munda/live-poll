"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useGuestJoinSession } from "../api/use-sessions";
import { RoomCodeField } from "./room-code-field";
import { cn } from "@/lib/utils";

const guestJoinSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(254),
  roomCode: z
    .string()
    .trim()
    .toUpperCase()
    .length(6, "Room code must be 6 characters"),
});

type GuestJoinValues = z.infer<typeof guestJoinSchema>;

type GuestJoinFormProps = {
  className?: string;
  submitLabel?: string;
};

export function GuestJoinForm({
  className,
  submitLabel = "Join session",
}: GuestJoinFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const guestJoinSession = useGuestJoinSession();

  const form = useForm<GuestJoinValues>({
    resolver: zodResolver(guestJoinSchema),
    defaultValues: {
      name: "",
      email: "",
      roomCode: searchParams.get("code")?.toUpperCase() ?? "",
    },
  });

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      form.setValue("roomCode", code.toUpperCase());
    }
  }, [form, searchParams]);

  async function handleSubmit(values: GuestJoinValues) {
    try {
      const session = await guestJoinSession.mutateAsync(values);
      router.push(`/session/${session.id}`);
    } catch (error) {
      applyApiErrorsToForm(error, form.setError);
    }
  }

  return (
    <form
      className={cn(className, "w-full ")}
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
    >
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="guest-name">Your name</FieldLabel>
          <Input
            id="guest-name"
            autoComplete="name"
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="guest-email">Email</FieldLabel>
          <Input
            id="guest-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
          <FieldError errors={[form.formState.errors.email]} />
        </Field>

        <RoomCodeField
          id="guest-room-code"
          error={form.formState.errors.roomCode}
          registration={form.register("roomCode")}
        />
      </FieldGroup>

      <Button
        type="submit"
        className="mt-4 w-full rounded-full"
        disabled={form.formState.isSubmitting || guestJoinSession.isPending}
      >
        {guestJoinSession.isPending ? "Joining..." : submitLabel}
      </Button>
    </form>
  );
}
