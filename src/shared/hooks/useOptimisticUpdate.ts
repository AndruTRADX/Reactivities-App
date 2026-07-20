import type { QueryKey } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"

type OptimisticUpdateConfig<TData, TVariables> = {
  /**
   * The single cache entry being optimistically edited. Read via `getQueryData`,
   * snapshotted, updated with `updater`, and restored here if the mutation fails.
   */
  optimisticQueryKey: (variables: TVariables) => QueryKey

  /**
   * Other cache entries that show the same data but aren't hand-edited (e.g. a list
   * view). Only cancelled — to stop an in-flight refetch from racing the optimistic
   * write — never snapshotted or rolled back. Bringing these back in sync after the
   * mutation settles is `onSuccess`/`invalidateQueries`' job, not this hook's.
   */
  relatedQueryKeysToCancel?: (variables: TVariables) => QueryKey[]

  /** Pure transform: given the current cached data and the mutation's variables, return the optimistic replacement. No side effects. */
  updater: (oldData: TData, variables: TVariables) => TData
}

/**
 * Standardized optimistic-update handlers for a `useMutation` call. Returns
 * `{ onMutate, onError }` — spread both straight into `useMutation` alongside
 * `mutationFn` (and `onSuccess` if the mutation also needs post-success cache
 * invalidation).
 */
export const useOptimisticUpdate = <TData, TVariables>({
  optimisticQueryKey,
  relatedQueryKeysToCancel,
  updater,
}: OptimisticUpdateConfig<TData, TVariables>) => {
  const queryClient = useQueryClient()

  const onMutate = async (variables: TVariables) => {
    const key = optimisticQueryKey(variables)
    const keysToCancel = [key, ...(relatedQueryKeysToCancel?.(variables) ?? [])]
    await Promise.all(keysToCancel.map(k => queryClient.cancelQueries({ queryKey: k })))

    const previousData = queryClient.getQueryData<TData>(key)
    if (previousData !== undefined) {
      queryClient.setQueryData<TData>(key, updater(previousData, variables))
    }

    return { previousData }
  }

  const onError = (_error: unknown, variables: TVariables, context?: { previousData?: TData }) => {
    if (context?.previousData !== undefined) {
      queryClient.setQueryData(optimisticQueryKey(variables), context.previousData)
    }
  }

  return { onMutate, onError }
}
