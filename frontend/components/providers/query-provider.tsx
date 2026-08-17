"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { showErrorToast } from "@/lib/errors";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            showErrorToast(error, "Failed to load data");
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
          mutations: {
            onError: (error) => {
              showErrorToast(error);
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
