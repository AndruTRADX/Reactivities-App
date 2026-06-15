import type { UserResponse } from "@/features/account/schemas/response/UserResponse";
import agent from "@/shared/services/agent";
import { useQuery } from "@tanstack/react-query";

export const useGetCurrentUser = () => {
  const { data, isPending, error } = useQuery<UserResponse>({
    queryKey: ["user"],
    queryFn: async () => {
      return await agent.get<UserResponse>(`/account/user-info`)
    },
  })

  return {
    user: data,
    isPendingUser: isPending,
    errorUser: error,
  }
}