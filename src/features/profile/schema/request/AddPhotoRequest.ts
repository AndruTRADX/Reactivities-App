import { z } from "zod"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"]

export const AddPhotoRequestSchema = z.object({
  file: z
    .instanceof(File, { message: "Please upload a file." })
    .refine(file => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      file => ACCEPTED_FILE_TYPES.includes(file?.type),
      ".jpg, .jpeg, .png and .pdf files are accepted."
    ),
})

export type AddPhotoRequest = z.infer<typeof AddPhotoRequestSchema>
