import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import z from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const requiredString = (fieldName: string, min = 1, max?: number) => {
  const hasCustomMin = min > 1

  let schema = z
    .string({ message: `${fieldName} is required` })
    .min(1, `${fieldName} is required`)
    .refine(
      val => !hasCustomMin || val.length >= min,
      `${fieldName} must have at least ${min} characters`
    )

  if (max !== undefined) {
    schema = schema.refine(
      val => val.length <= max,
      `${fieldName} must not exceed ${max} characters`
    )
  }

  return schema
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 300
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout>

  return (...args: Args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
