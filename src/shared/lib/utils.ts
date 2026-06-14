import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import z from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const requiredString = (fieldName: string, min = 1) => {
  const hasCustomMin = min > 1

  return z
    .string({ message: `${fieldName} is required` })
    .min(1, `${fieldName} is required`)
    .refine(
      (val) => !hasCustomMin || val.length >= min,
      `${fieldName} must have at least ${min} characters`
    )
}

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
