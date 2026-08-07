import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { HugeiconsIcon } from "@hugeicons/react"
import { Reload, SentIcon } from "@hugeicons/core-free-icons"
import { CardContent } from "@sharedUi/card"
import { Button } from "@sharedUi/button"
import { Spinner } from "@sharedUi/spinner"
import { ButtonGroup } from "@sharedUi/button-group"
import TextInput from "@sharedForms/TextInput"
import {
  AddCommentRequestSchema,
  type AddCommentRequest,
} from "@activities/schemas/request/AddCommentRequest"

interface Props {
  onSubmit: (body: string) => Promise<unknown>
  isPending: boolean
}

export default function CommentForm({ onSubmit, isPending }: Props) {
  const form = useForm<AddCommentRequest>({
    resolver: zodResolver(AddCommentRequestSchema),
    defaultValues: { body: "" },
    mode: "onTouched",
  })

  const {
    formState: { isValid },
  } = form

  const isDisabled = useMemo(() => isPending || !isValid, [isPending, isValid])

  const handleSubmit = useCallback(
    async ({ body }: AddCommentRequest) => {
      await onSubmit(body)
      document
        .querySelector("#activity-comment-container")
        ?.scrollTo({ top: document.body.scrollHeight })
      form.reset()
    },
    [onSubmit, form]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        void form.handleSubmit(handleSubmit)()
      }
    },
    [form, handleSubmit]
  )

  return (
    <CardContent>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-start gap-2">
        <TextInput
          control={form.control}
          name="body"
          multiline
          rows={1}
          placeholder="Enter comment (Enter to submit, SHIFT + Enter for new line)."
          onKeyDown={handleKeyDown}
          disabled={isPending}
        />
        <ButtonGroup>
          <Button type="submit" size="default" disabled={isDisabled} aria-label="Send comment">
            {isPending ? <Spinner /> : <HugeiconsIcon icon={SentIcon} />}
          </Button>
          <Button
            type="button"
            size="default"
            aria-label="Clear comment"
            onClick={() => form.reset()}
            variant="outline"
          >
            <HugeiconsIcon icon={Reload} />
          </Button>
        </ButtonGroup>
      </form>
    </CardContent>
  )
}
