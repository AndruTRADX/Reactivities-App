import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@sharedUi/pagination"
import { getPaginationRange } from "@/shared/lib/pagination"

interface Props {
  pageIndex: number
  pageCount: number
  onPageChange: (pageIndex: number) => void
}

export function PaginationControl({ pageIndex, pageCount, onPageChange }: Props) {
  if (pageCount <= 1) {
    return null
  }

  const pages = getPaginationRange(pageIndex, pageCount)
  const isFirstPage = pageIndex <= 1
  const isLastPage = pageIndex >= pageCount

  const goToPage = (page: number) => {
    if (page === pageIndex) return
    onPageChange(page)
    document.querySelector("#reactivities-main-container")?.scrollTo({ top: 0 })
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={isFirstPage}
            className={isFirstPage ? "pointer-events-none opacity-50" : undefined}
            onClick={e => {
              e.preventDefault()
              if (!isFirstPage) goToPage(pageIndex - 1)
            }}
          />
        </PaginationItem>

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === pageIndex}
                onClick={e => {
                  e.preventDefault()
                  goToPage(page)
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={isLastPage}
            className={isLastPage ? "pointer-events-none opacity-50" : undefined}
            onClick={e => {
              e.preventDefault()
              if (!isLastPage) goToPage(pageIndex + 1)
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
