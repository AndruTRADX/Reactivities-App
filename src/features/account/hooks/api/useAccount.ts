import agent from "@/shared/services/agent"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { LoginRequest } from "@account/schemas/request/LoginRequest"
import type { RegisterUserRequest } from "../../schemas/request/RegisterUserRequest";

export const useLoginAccount = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (login: LoginRequest) => {
      return await agent.post("/login?useCookies=true", login)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user"],
      })
    },
  })

  return {
    loginAccountAsync: mutateAsync,
    isPendingLoginAccount: isPending,
  }
}

export const useRegisterAccount = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (register: RegisterUserRequest) => {
      return await agent.post("/account/register", register)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user"],
      })
    },
  })

  return {
    registerAccountAsync: mutateAsync,
    isPendingRegisterAccount: isPending,
  }
}
