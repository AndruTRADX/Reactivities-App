import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@sharedUi/alert-dialog"
import { Button } from "@sharedUi/button"
import { useConfirmDialogStore } from "@/shared/stores/confirmDialogStore"

export const ConfirmDialog = () => {
  const { isOpen, options, handleConfirm, handleCancel, close } = useConfirmDialogStore()

  return (
    <AlertDialog open={isOpen} onOpenChange={close}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          <AlertDialogDescription>{options.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} variant="default" size="default">
            {options.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            asChild
            variant={options.confirmVariant}
            size="default"
          >
            <Button variant={options.confirmVariant}>{options.confirmText}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
