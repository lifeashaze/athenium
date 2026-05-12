"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import dynamic from "next/dynamic";
import React from "react";

const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools
    ),
  { ssr: false }
);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 15,
        gcTime: 1000 * 60 * 10,
        retry: (failureCount, error) => {
          if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401 || status === 403 || status === 404) {
              return false;
            }
          }

          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 2000),
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
