import agent from "@/shared/services/agent"
import { useMutation } from "@tanstack/react-query"
import type { LoginRequest } from "@account/schemas/request/LoginRequest"

export const useLoginAccount = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (login: LoginRequest) => {
      return await agent.post("/login?useCookies=true", login)
    },
  })

  return {
    loginAccountAsync: mutateAsync,
    isPendingLoginAccount: isPending,
  }
}
