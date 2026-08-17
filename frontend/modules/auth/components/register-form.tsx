"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PasswordInput } from "./password-input";
import { registerSchema, type RegisterValues } from "../schemas/auth.schema";
import { authClient } from "../../../lib/auth-client";
import { showErrorToast } from "@/lib/errors";
import { redirectByRole } from "../utils/helpers";
import type { UserRole } from "@/shared/types";

const roles: { value: UserRole; label: string }[] = [
  { value: "participant", label: "Participant" },
  { value: "host", label: "Host" },
];

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "participant",
    },
  });

  async function onSubmit(values: RegisterValues) {
    const { data, error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
    });

    if (error) {
      const message = error.message || "Could not create your account.";
      showErrorToast(error, message);
      form.setError("root", { message });
      return;
    }

    redirectByRole(router, data?.user.role);
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="name">Display name</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Alex Rivera"
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
          <FieldError errors={[form.formState.errors.email]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>

        <Controller
          name="role"
          control={form.control}
          render={({ field }) => (
            <Field data-invalid={!!form.formState.errors.role}>
              <FieldLabel>Role</FieldLabel>
              <RadioGroup
                className="flex gap-6"
                value={field.value}
                onValueChange={field.onChange}
              >
                {roles.map((option) => (
                  <Field
                    key={option.value}
                    orientation="horizontal"
                    className="w-auto items-center gap-2"
                  >
                    <RadioGroupItem
                      id={`role-${option.value}`}
                      value={option.value}
                    />
                    <FieldLabel
                      htmlFor={`role-${option.value}`}
                      className="font-normal"
                    >
                      {option.label}
                    </FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
              <FieldError errors={[form.formState.errors.role]} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldError errors={[form.formState.errors.root]} />

      <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
