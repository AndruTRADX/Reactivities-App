import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@sharedUi/button"
import { Spinner } from "@sharedUi/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sharedUi/dialog"
import TextInput from "@sharedForms/TextInput"
import {
  CancelActivityRequestSchema,
  type CancelActivityRequest,
} from "@activities/schemas/request/CancelActivityRequest"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: CancelActivityRequest) => Promise<void>
  isPending: boolean
}

export function CancelActivityDialog({ open, onOpenChange, onConfirm, isPending }: Props) {
  const form = useForm<CancelActivityRequest>({
    resolver: zodResolver(CancelActivityRequestSchema),
    defaultValues: { reason: "" },
  })

  const {
    formState: { isValid },
  } = form

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) form.reset()
      onOpenChange(next)
    },
    [form, onOpenChange]
  )

  const onSubmit = useCallback(
    async (data: CancelActivityRequest) => {
      await onConfirm(data)
      form.reset()
    },
    [onConfirm, form]
  )

  const isSubmitting = useMemo(() => isPending, [isPending])
  const isDisabled = useMemo(() => isPending || !isValid, [isPending, isValid])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Activity</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Optionally let attendees know why.
          </DialogDescription>
        </DialogHeader>
        <form id="cancel-activity-form" onSubmit={form.handleSubmit(onSubmit)}>
          <TextInput
            control={form.control}
            name="reason"
            multiline
            rows={3}
            placeholder="Reason (optional)"
          />
        </form>
        <DialogFooter showCloseButton>
          <Button
            type="submit"
            form="cancel-activity-form"
            variant="destructive"
            disabled={isDisabled}
          >
            {isSubmitting ? (
              <>
                <Spinner /> Cancelling
              </>
            ) : (
              "Cancel Activity"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
