import { useSearchParams } from "react-router"

export const usePagedParams = <TSort extends string = string>(
  key: string,
  defaultPageSize = 10
) => {
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
