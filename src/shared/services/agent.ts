import axios, { type AxiosResponse, type AxiosError } from "axios"
import type { ApiResponse } from "../schemas/response/ApiResponse"

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
  (error: AxiosError) => {
    console.error("Error en la petición:", error.message)
    return Promise.reject(error)
  }
)

export default agent
