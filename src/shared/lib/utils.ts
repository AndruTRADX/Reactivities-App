import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import z from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const requiredString = (fieldString: string) =>
  z.string({ message: `${fieldString} is required` }).min(1, `${fieldString} is required`)
