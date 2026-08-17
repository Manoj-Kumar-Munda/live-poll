"use client";

import { useState } from "react";
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
import { useCreateQuiz, useQuizzes } from "../api/use-quizzes";
import {
  createQuizSchema,
  type CreateQuizValues,
} from "../schemas/quiz.schema";
import type { QuizStatus } from "../types";
import { StatusBadge } from "./status-badge";

const FILTERS: { label: string; value?: QuizStatus }[] = [
  { label: "All" },
  { label: "Drafts", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
];

export function QuizListPage() {
  const router = useRouter();
  const [status, setStatus] = useState<QuizStatus | undefined>();
  const [showCreate, setShowCreate] = useState(false);

  const { data: quizzes = [], isLoading } = useQuizzes(status);
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Quizzes
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Create a draft, add questions, then publish.
          </p>
        </div>
        <Button type="button" onClick={() => setShowCreate((open) => !open)}>
          {showCreate ? "Close" : "New quiz"}
        </Button>
      </div>

      {showCreate ? (
        <form
          className="mt-6 rounded-xl border border-border bg-surface p-5"
          onSubmit={form.handleSubmit(onCreate)}
          noValidate
        >
          <h2 className="font-display text-lg font-semibold">New quiz</h2>
          <FieldGroup className="mt-4">
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
              <Field>
                <FieldLabel htmlFor="points">Points per MCQ</FieldLabel>
                <Input
                  id="points"
                  type="number"
                  min={1}
                  {...form.register("pointsPerQuestion", { valueAsNumber: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="time">Seconds per question</FieldLabel>
                <Input
                  id="time"
                  type="number"
                  min={5}
                  {...form.register("timeLimitSeconds", { valueAsNumber: true })}
                />
              </Field>
            </div>
          </FieldGroup>
          <Button
            className="mt-4"
            type="submit"
            disabled={createQuiz.isPending}
          >
            {createQuiz.isPending ? "Creating..." : "Create draft"}
          </Button>
        </form>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter.label}
            type="button"
            size="sm"
            variant={status === filter.value ? "default" : "outline"}
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading...</p>
      ) : quizzes.length === 0 ? (
        <p className="mt-6 text-sm text-text-secondary">
          No quizzes in this filter.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              <Link
                href={`/dashboard/quizzes/${quiz.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-raised"
              >
                <div>
                  <p className="font-medium">{quiz.title}</p>
                  <p className="text-sm text-text-secondary">
                    {quiz.questionCount}{" "}
                    {quiz.questionCount === 1 ? "question" : "questions"} ·{" "}
                    {quiz.timeLimitSeconds}s
                  </p>
                </div>
                <StatusBadge status={quiz.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
