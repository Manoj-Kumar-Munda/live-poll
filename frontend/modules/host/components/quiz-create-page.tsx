"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { applyApiErrorsToForm } from "@/lib/errors";
import { useCreateQuiz } from "../api/use-quizzes";
import {
  createQuizSchema,
  type CreateQuizValues,
} from "../schemas/quiz.schema";

export function QuizCreatePage() {
  const router = useRouter();
  const createQuiz = useCreateQuiz();

  const form = useForm<CreateQuizValues>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      pointsPerQuestion: 10,
      timeLimitSeconds: 30,
    },
  });

  async function onCreate(values: CreateQuizValues) {
    try {
      const quiz = await createQuiz.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        pointsPerQuestion: values.pointsPerQuestion,
        timeLimitSeconds: values.timeLimitSeconds,
      });
      router.push(`/dashboard/quizzes/${quiz.id}`);
    } catch (error) {
      applyApiErrorsToForm(error, form.setError);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <Link
        href="/dashboard/quizzes"
        className="text-sm font-medium text-primary hover:underline"
      >
        Back to quizzes
      </Link>

      <div className="mt-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          New quiz
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Start with a title and defaults. You can add questions on the next
          screen.
        </p>
      </div>

      <form
        className="mt-8 max-w-xl rounded-xl border border-border bg-surface p-5"
        onSubmit={form.handleSubmit(onCreate)}
        noValidate
      >
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.title}>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input
              id="title"
              placeholder="Friday icebreaker"
              {...form.register("title")}
            />
            <FieldError errors={[form.formState.errors.title]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Input
              id="description"
              placeholder="Optional"
              {...form.register("description")}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.pointsPerQuestion}>
              <FieldLabel htmlFor="points">Points per MCQ</FieldLabel>
              <Input
                id="points"
                type="number"
                min={1}
                {...form.register("pointsPerQuestion", { valueAsNumber: true })}
              />
              <FieldError errors={[form.formState.errors.pointsPerQuestion]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.timeLimitSeconds}>
              <FieldLabel htmlFor="time">Seconds per question</FieldLabel>
              <Input
                id="time"
                type="number"
                min={5}
                {...form.register("timeLimitSeconds", { valueAsNumber: true })}
              />
              <FieldError errors={[form.formState.errors.timeLimitSeconds]} />
            </Field>
          </div>
        </FieldGroup>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="submit" disabled={createQuiz.isPending}>
            {createQuiz.isPending ? "Creating..." : "Create draft"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            nativeButton={false}
            render={<Link href="/dashboard/quizzes" />}
          >
            Cancel
          </Button>
        </div>
      </form>
    </main>
  );
}
