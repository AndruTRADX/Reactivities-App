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

const agent = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

agent.interceptors.response.use(
  <T>(response: AxiosResponse<ApiResponse<T>>): T => {
    const apiResponse = response.data

    if (!apiResponse.success) {
      const errorMessage = apiResponse.message || "Error en la petición"
      const errors = apiResponse.errors || []

      throw {
        message: errorMessage,
        errors,
        response,
      }
    }

    return apiResponse.data as T
  },
  <T>(error: AxiosError<ProblemDetailsResponse<T>>) => {
    

    const status = error.response?.status
    const title = error.response?.data?.title
    const message = error.response?.data?.message
    const errors = error.response?.data?.errors

    switch (status) {
      case 400:
        if (errors && Object.keys(errors).length > 0) {
          const errorLines: string[] = []
          for (const [field, messages] of Object.entries(errors)) {
            errorLines.push(`${field}:`)
            messages.forEach(msg => errorLines.push(`  • ${msg}`))
          }
          const formattedError = errorLines.join("\n")

          toast.error(`${title}: ${message}`, {
            style: { whiteSpace: "pre-line" },
            description: formattedError,
            icon: null
          })
        } else {
          toast.error(`${title}: ${message}`)
        }
        return Promise.reject(error)
      case 401:
        toast.error(`${title}: ${message}`)
        return Promise.reject(error)
      case 404:
        router.navigate('/not-found', { state: error.response?.data })
        return Promise.reject(error)
      case 500:
        router.navigate('/server-error', { state: error.response?.data })
        return Promise.reject(error)
      default:
        return Promise.reject(error)
    }
  }
)

export default agent
