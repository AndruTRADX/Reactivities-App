export type PaginationRangeItem = number | "ellipsis"

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i)

export const getPaginationRange = (
  pageIndex: number,
  pageCount: number,
  siblingCount = 1
): PaginationRangeItem[] => {
  const totalPageNumbers = siblingCount + 5

  if (pageCount <= totalPageNumbers) {
    return range(1, pageCount)
  }

  const leftSiblingIndex = Math.max(pageIndex - siblingCount, 1)
  const rightSiblingIndex = Math.min(pageIndex + siblingCount, pageCount)

  const shouldShowLeftEllipsis = leftSiblingIndex > 2
  const shouldShowRightEllipsis = rightSiblingIndex < pageCount - 1

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount
    return [...range(1, leftItemCount), "ellipsis", pageCount]
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount
    return [1, "ellipsis", ...range(pageCount - rightItemCount + 1, pageCount)]
  }

  return [1, "ellipsis", ...range(leftSiblingIndex, rightSiblingIndex), "ellipsis", pageCount]
}
