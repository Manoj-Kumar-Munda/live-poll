import axios, { type AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiFieldError = {
  path: string;
  message: string;
};

export class ApiRequestError extends Error {
  statusCode: number;
  errors: ApiFieldError[];

  constructor(
    statusCode: number,
    message: string,
    errors: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: ApiFieldError[];
};

function toApiRequestError(
  statusCode: number,
  payload: Partial<ApiEnvelope<unknown>>,
) {
  return new ApiRequestError(
    payload.statusCode ?? statusCode,
    payload.message || "Request failed",
    payload.errors ?? [],
  );
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => {
    const body = response.data;

    if (body && typeof body === "object" && "success" in body) {
      const envelope = body as ApiEnvelope<unknown>;
      if (!envelope.success) {
        throw toApiRequestError(response.status, envelope);
      }
      response.data = envelope.data;
    }

    return response;
  },
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    if (error.response?.data && typeof error.response.data === "object") {
      throw toApiRequestError(error.response.status, error.response.data);
    }

    if (!error.response) {
      throw new ApiRequestError(
        0,
        "Network error. Check your connection and try again.",
      );
    }

    throw new ApiRequestError(error.response.status, "Request failed");
  },
);

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return fallback;
}
