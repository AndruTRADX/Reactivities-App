import axios, { type AxiosResponse, type AxiosError } from "axios"
import type { ApiResponse } from "../schemas/response/ApiResponse"
import type { ProblemDetailsResponse } from "../schemas/response/ProblemDetailsResponse"
import { toast } from "sonner"
import { router } from "@/app/router/Route"

declare module "axios" {
  export interface AxiosInstance {
    get<T = unknown>(url: string, config?: unknown): Promise<T>
    post<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>
    put<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>
    patch<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>
    delete<T = unknown>(url: string, config?: unknown): Promise<T>
  }
}

const STATUS_LABELS: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  500: "Server Error",
}

const agent = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
})

agent.interceptors.response.use(
  <T>(response: AxiosResponse<ApiResponse<T>>): T => {
    const apiResponse = response.data

    return apiResponse.data as T
  },
  <T>(error: AxiosError<ProblemDetailsResponse<T>>) => {
    if (!error.response) {
      toast.error(`Error de red: ${error.message}`)
      return Promise.reject(error)
    }

    const status = error.response.status
    const data = error.response.data

    const hasBody = data && typeof data === "object"
    const title = (hasBody && data.title) || STATUS_LABELS[status] || "Error"
    const message = (hasBody && data.message) || error.message
    const errors = hasBody ? data.errors : undefined

    switch (status) {
      case 400:
        if (errors && Object.keys(errors).length > 0) {
          const errorLines: string[] = []
          for (const [field, messages] of Object.entries(errors)) {
            errorLines.push(`${field}:`)
            messages.forEach(msg => errorLines.push(`  • ${msg}`))
          }
          toast.error(`${title}: ${message}`, {
            style: { whiteSpace: "pre-line" },
            description: errorLines.join("\n"),
            icon: null,
          })
        } else {
          toast.error(`${title}: ${message}`)
        }
        return Promise.reject(error)

      case 401:
        toast.error(`${title}: ${message}`)
        return Promise.reject(error)

      case 404:
        router.navigate("/not-found", { state: error.response.data })
        return Promise.reject(error)

      case 500:
        router.navigate("/server-error", { state: error.response.data })
        return Promise.reject(error)

      default:
        toast.error(`${title}: ${message}`)
        return Promise.reject(error)
    }
  }
)

export default agent
