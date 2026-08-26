"use client";

import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  questionFormSchema,
  type QuestionFormValues,
} from "../schemas/quiz.schema";
import type { Question, QuestionInput } from "../types";

const TYPE_LABELS: Record<QuestionFormValues["type"], string> = {
  MCQ: "Multiple choice",
  POLL: "Poll",
  OPEN_TEXT: "Open text",
};

function emptyValues(): QuestionFormValues {
  return {
    type: "MCQ",
    prompt: "",
    options: ["", ""],
    correctAnswer: "",
    maxLength: 80,
  };
}

function valuesFromQuestion(question: Question): QuestionFormValues {
  return {
    type: question.type,
    prompt: question.prompt,
    options:
      question.options && question.options.length >= 2
        ? question.options
        : ["", ""],
    correctAnswer: question.correctAnswer ?? "",
    maxLength: question.maxLength ?? 80,
  };
}

export function toQuestionInput(values: QuestionFormValues): QuestionInput {
  if (values.type === "MCQ") {
    return {
      type: "MCQ",
      prompt: values.prompt,
      options: values.options,
      correctAnswer: values.correctAnswer,
    };
  }

  if (values.type === "POLL") {
    return {
      type: "POLL",
      prompt: values.prompt,
      options: values.options,
    };
  }

  return {
    type: "OPEN_TEXT",
    prompt: values.prompt,
    maxLength: values.maxLength,
  };
}

function getOptionsGroupError(
  optionsErrors: FieldErrors<QuestionFormValues>["options"],
) {
  if (!optionsErrors || Array.isArray(optionsErrors)) {
    return [];
  }

  if (optionsErrors.message) {
    return [{ message: optionsErrors.message }];
  }

  if (optionsErrors.root?.message) {
    return [{ message: optionsErrors.root.message }];
  }

  return [];
}

type QuestionFormProps = {
  question?: Question;
  submitLabel: string;
  onSubmit: (input: QuestionInput) => Promise<void>;
  onCancel?: () => void;
};

export function QuestionForm({
  question,
  submitLabel,
  onSubmit,
  onCancel,
}: QuestionFormProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: question ? valuesFromQuestion(question) : emptyValues(),
  });

  const type = form.watch("type");
  const optionValues = form.watch("options");
  const maxOptions = type === "POLL" ? 6 : 4;

  async function handleSubmit(values: QuestionFormValues) {
    await onSubmit(toQuestionInput(values));
    if (!question) {
      form.reset(emptyValues());
    }
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="question-type">Type</FieldLabel>
          <select
            id="question-type"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            {...form.register("type")}
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field data-invalid={!!form.formState.errors.prompt}>
          <FieldLabel htmlFor="question-prompt">Prompt</FieldLabel>
          <Input
            id="question-prompt"
            placeholder="What should people answer?"
            aria-invalid={!!form.formState.errors.prompt}
            {...form.register("prompt")}
          />
          <FieldError errors={[form.formState.errors.prompt]} />
        </Field>

        {type !== "OPEN_TEXT" ? (
          <div className="space-y-2">
            <FieldLabel>Options</FieldLabel>
            {(optionValues ?? []).map((_, index) => (
              <div key={index} className="space-y-1">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    aria-invalid={!!form.formState.errors.options?.[index]}
                    {...form.register(`options.${index}`)}
                  />
                  {(optionValues?.length ?? 0) > 2 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        form.setValue(
                          "options",
                          (optionValues ?? []).filter((_, i) => i !== index),
                        )
                      }
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
                <FieldError
                  errors={[form.formState.errors.options?.[index]]}
                />
              </div>
            ))}
            <FieldError errors={getOptionsGroupError(form.formState.errors.options)} />
            {(optionValues?.length ?? 0) < maxOptions ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  form.setValue("options", [...(optionValues ?? []), ""])
                }
              >
                Add option
              </Button>
            ) : null}
          </div>
        ) : (
          <Field data-invalid={!!form.formState.errors.maxLength}>
            <FieldLabel htmlFor="max-length">Character limit</FieldLabel>
            <Input
              id="max-length"
              type="number"
              min={1}
              max={500}
              {...form.register("maxLength", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.maxLength]} />
          </Field>
        )}

        {type === "MCQ" ? (
          <Field data-invalid={!!form.formState.errors.correctAnswer}>
            <FieldLabel htmlFor="correct-answer">Correct answer</FieldLabel>
            <select
              id="correct-answer"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              {...form.register("correctAnswer")}
            >
              <option value="">Select the correct option</option>
              {optionValues
                .filter((option) => option.trim())
                .map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
            <FieldError errors={[form.formState.errors.correctAnswer]} />
          </Field>
        ) : null}
      </FieldGroup>

      <FieldError errors={[form.formState.errors.root]} />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
