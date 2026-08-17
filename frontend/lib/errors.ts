import axios from "axios";
import { toast } from "sonner";
import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";
import { ApiRequestError } from "@/lib/api";

export function formatApiError(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError) {
    if (error.errors.length > 0) {
      const details = error.errors.map((item) => item.message).join(" · ");
      return `${error.message}: ${details}`;
    }

    return error.message;
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Network error. Check your connection and try again.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function showErrorToast(error: unknown, fallback = "Something went wrong") {
  toast.error(formatApiError(error, fallback));
}

export function applyApiErrorsToForm<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!(error instanceof ApiRequestError) || error.errors.length === 0) {
    return false;
  }

  for (const item of error.errors) {
    setError(item.path as FieldPath<T>, { message: item.message });
  }

  return true;
}
