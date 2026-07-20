import { useSearchParams } from "react-router"

type PagedParams<TSort extends string> = {
  /** Current 1-based page read from the URL, defaulting to `1` when absent. */
  pageIndex: number

  /** Current page size read from the URL, defaulting to `defaultPageSize` when absent. */
  pageSize: number

  /** Current sort value read from the URL, or `undefined` if none is set. */
  sort: TSort | undefined

  /** Updates the URL's page index. Leaves `pageSize` and `sort` untouched. */
  setPageIndex: (nextPageIndex: number) => void

  /**
   * Updates the URL's sort value and resets `pageIndex` back to `1` in the same
   * update — a new ordering makes whatever page you were on meaningless.
   */
  setSort: (nextSort: TSort) => void
}

/**
 * Owns a paginated list's page/size/sort state as URL search params instead of
 * component state, so the list stays shareable/bookmarkable and back/forward
 * navigation keeps working.
 *
 * @param key Required, unique-per-page string that namespaces the URL params
 * (`${key}PageIndex`, `${key}PageSize`, `${key}Sort`) — without it, two lists
 * on the same page would silently read/write the same query params.
 * @param defaultPageSize Page size to fall back to when the URL has none.
 */
export const usePagedParams = <TSort extends string = string>(
  key: string,
  defaultPageSize = 10
): PagedParams<TSort> => {
  const [searchParams, setSearchParams] = useSearchParams()

  const pageIndex = Number(searchParams.get(`${key}PageIndex`) ?? 1)
  const pageSize = Number(searchParams.get(`${key}PageSize`) ?? defaultPageSize)
  const sort = (searchParams.get(`${key}Sort`) ?? undefined) as TSort | undefined

  const setPageIndex = (nextPageIndex: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set(`${key}PageIndex`, String(nextPageIndex))
      return next
    })
  }

  const setSort = (nextSort: TSort) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set(`${key}Sort`, nextSort)
      next.set(`${key}PageIndex`, "1")
      return next
    })
  }

  return { pageIndex, pageSize, sort, setPageIndex, setSort }
}
