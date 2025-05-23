
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState } from "react"
import { toast } from "sonner"

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
      },
      mutations: {
        onError: (error) => {
          console.error("Mutation error:", error);
          toast.error("An error occurred. Please try again.");
        },
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
