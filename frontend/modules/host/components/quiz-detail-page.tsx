"use client";

import { useEffect, useState } from "react";
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
import {
  useAddQuestion,
  useArchiveQuiz,
  useDeleteQuestion,
  useDeleteQuiz,
  usePublishQuiz,
  useQuiz,
  useUpdateQuestion,
  useUpdateQuiz,
} from "../api/use-quizzes";
import {
  createQuizSchema,
  type CreateQuizValues,
} from "../schemas/quiz.schema";
import type { Question, QuestionInput } from "../types";
import { QuestionForm } from "./question-form";
import { StatusBadge } from "./status-badge";

type QuizDetailPageProps = {
  quizId: string;
};

export function QuizDetailPage({ quizId }: QuizDetailPageProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: quiz, isLoading, isError } = useQuiz(quizId);
  const updateQuiz = useUpdateQuiz(quizId);
  const deleteQuiz = useDeleteQuiz();
  const addQuestion = useAddQuestion(quizId);
  const updateQuestion = useUpdateQuestion(quizId);
  const deleteQuestion = useDeleteQuestion(quizId);
  const publishQuiz = usePublishQuiz(quizId);
  const archiveQuiz = useArchiveQuiz(quizId);

  const form = useForm<CreateQuizValues>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      pointsPerQuestion: 10,
      timeLimitSeconds: 30,
    },
  });

  useEffect(() => {
    if (!quiz) {
      return;
    }

    form.reset({
      title: quiz.title,
      description: quiz.description ?? "",
      pointsPerQuestion: quiz.pointsPerQuestion,
      timeLimitSeconds: quiz.timeLimitSeconds,
    });
  }, [form, quiz]);

  const isDraft = quiz?.status === "DRAFT";

  async function saveMeta(values: CreateQuizValues) {
    try {
      await updateQuiz.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        pointsPerQuestion: values.pointsPerQuestion,
        timeLimitSeconds: values.timeLimitSeconds,
      });
    } catch (error) {
      applyApiErrorsToForm(error, form.setError);
    }
  }

  async function handleAdd(input: QuestionInput) {
    try {
      await addQuestion.mutateAsync(input);
    } catch {
      throw new Error("add-question-failed");
    }
  }

  async function handleUpdate(questionId: string, input: QuestionInput) {
    try {
      await updateQuestion.mutateAsync({ questionId, input });
      setEditingId(null);
    } catch {
      throw new Error("update-question-failed");
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    try {
      await deleteQuestion.mutateAsync(questionId);
    } catch {
      // Toast handled globally.
    }
  }

  async function handlePublish() {
    try {
      await publishQuiz.mutateAsync();
    } catch {
      // Toast handled globally.
    }
  }

  async function handleArchive() {
    try {
      await archiveQuiz.mutateAsync();
    } catch {
      // Toast handled globally.
    }
  }

  async function handleDeleteQuiz() {
    try {
      await deleteQuiz.mutateAsync(quizId);
      router.replace("/dashboard/quizzes");
    } catch {
      // Toast handled globally.
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10 text-sm text-muted-foreground sm:px-8">
        Loading quiz...
      </main>
    );
  }

  if (isError || !quiz) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p className="text-sm text-text-secondary">Quiz not found.</p>
        <Link
          href="/dashboard/quizzes"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to quizzes
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <Link
        href="/dashboard/quizzes"
        className="text-sm font-medium text-primary hover:underline"
      >
        Back to quizzes
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {quiz.title}
            </h1>
            <StatusBadge status={quiz.status} />
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {quiz.questionCount}{" "}
            {quiz.questionCount === 1 ? "question" : "questions"} ·{" "}
            {quiz.pointsPerQuestion} pts · {quiz.timeLimitSeconds}s
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isDraft ? (
            <>
              <Button
                type="button"
                onClick={handlePublish}
                disabled={
                  quiz.questionCount === 0 || publishQuiz.isPending
                }
              >
                {publishQuiz.isPending ? "Publishing..." : "Publish"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteQuiz}
                disabled={deleteQuiz.isPending}
              >
                Delete
              </Button>
            </>
          ) : null}
          {quiz.status === "PUBLISHED" ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleArchive}
              disabled={archiveQuiz.isPending}
            >
              Archive
            </Button>
          ) : null}
        </div>
      </div>

      {isDraft ? (
        <form
          className="mt-8 rounded-xl border border-border bg-surface p-5"
          onSubmit={form.handleSubmit(saveMeta)}
          noValidate
        >
          <h2 className="font-display text-lg font-semibold">Details</h2>
          <FieldGroup className="mt-4">
            <Field data-invalid={!!form.formState.errors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input id="title" {...form.register("title")} />
              <FieldError errors={[form.formState.errors.title]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input id="description" {...form.register("description")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="points">Points per MCQ</FieldLabel>
                <Input
                  id="points"
                  type="number"
                  {...form.register("pointsPerQuestion", { valueAsNumber: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="time">Seconds per question</FieldLabel>
                <Input
                  id="time"
                  type="number"
                  {...form.register("timeLimitSeconds", { valueAsNumber: true })}
                />
              </Field>
            </div>
          </FieldGroup>
          <Button
            className="mt-4"
            type="submit"
            disabled={updateQuiz.isPending}
          >
            {updateQuiz.isPending ? "Saving..." : "Save details"}
          </Button>
        </form>
      ) : quiz.description ? (
        <p className="mt-6 text-sm text-text-secondary">{quiz.description}</p>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Questions</h2>
        {quiz.questions.length === 0 ? (
          <p className="mt-3 text-sm text-text-secondary">
            Add at least one question before you publish.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {quiz.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                editable={isDraft}
                editing={editingId === question.id}
                onEdit={() => setEditingId(question.id)}
                onCancel={() => setEditingId(null)}
                onSave={(input) => handleUpdate(question.id, input)}
                onDelete={() => handleDeleteQuestion(question.id)}
              />
            ))}
          </ol>
        )}
      </section>

      {isDraft ? (
        <section className="mt-8 rounded-xl border border-dashed border-border p-5">
          <h2 className="font-display text-lg font-semibold">Add a question</h2>
          <p className="mt-1 mb-4 text-sm text-text-secondary">
            Questions are added at the end. You can edit or delete them until
            you publish.
          </p>
          <QuestionForm submitLabel="Add question" onSubmit={handleAdd} />
        </section>
      ) : null}
    </main>
  );
}

function QuestionCard({
  question,
  index,
  editable,
  editing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
}: {
  question: Question;
  index: number;
  editable: boolean;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (input: QuestionInput) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  return (
    <li className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {index + 1}. {question.type.replace("_", " ")}
          </p>
          <p className="mt-1 font-medium">{question.prompt}</p>
          {question.options ? (
            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
              {question.options.map((option) => (
                <li key={option}>
                  {option}
                  {question.correctAnswer === option ? " · correct" : ""}
                </li>
              ))}
            </ul>
          ) : null}
          {question.maxLength != null ? (
            <p className="mt-2 text-sm text-text-secondary">
              Max {question.maxLength} characters
            </p>
          ) : null}
        </div>
        {editable && !editing ? (
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onEdit}>
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        ) : null}
      </div>
      {editing ? (
        <div className="mt-4 border-t border-border pt-4">
          <QuestionForm
            question={question}
            submitLabel="Save question"
            onSubmit={onSave}
            onCancel={onCancel}
          />
        </div>
      ) : null}
    </li>
  );
}
