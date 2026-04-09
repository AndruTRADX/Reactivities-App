import { Toaster } from "@/components/ui/sonner"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./app/layout/styles.css"
import App from "./app/layout/App.tsx"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
)
