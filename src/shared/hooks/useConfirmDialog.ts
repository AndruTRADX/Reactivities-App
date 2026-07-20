import { useConfirmDialogStore } from "@/shared/stores/confirmDialogStore"
import type { ConfirmOptions } from "@/shared/stores/confirmDialogStore"

type ConfirmDialogHandlers = {
  /**
   * Opens the app's single shared confirmation dialog with fully custom
   * copy/variant. Resolves `true` if the user confirms, `false` if they
   * cancel or dismiss the dialog (e.g. Escape). Put the actual side effect in
   * `options.onConfirm` — it runs before the promise resolves and before the
   * dialog closes; only await the returned promise if the boolean result
   * itself matters to the caller.
   */
  confirm: (options: ConfirmOptions) => Promise<boolean>

  /** `confirm`, preset with a destructive "Delete" button and "cannot be undone" copy. Pass `options` to override any field. */
  confirmDelete: (options: Omit<ConfirmOptions, "confirmVariant">) => Promise<boolean>

  /** `confirm`, preset with an "Update" button and confirmation copy. Pass `options` to override any field. */
  confirmUpdate: (options: Omit<ConfirmOptions, "confirmVariant">) => Promise<boolean>

  /** `confirm`, preset with a "Create" button and confirmation copy. Pass `options` to override any field. */
  confirmCreate: (options: Omit<ConfirmOptions, "confirmVariant">) => Promise<boolean>
}

/**
 * Triggers the single app-wide confirmation dialog (`<ConfirmDialog />`,
 * mounted once in `App.tsx`) instead of every feature building its own
 * `AlertDialog`. Backed by `useConfirmDialogStore` (Zustand), so any
 * component can open it without prop-drilling dialog state.
 *
 * Use the bare `confirm` for one-off copy, or one of the `confirm<Verb>`
 * helpers below to reuse the app's standard delete/update/create copy and
 * button variant.
 */
export const useConfirmDialog = (): ConfirmDialogHandlers => {
  const confirm = useConfirmDialogStore(state => state.confirm)

  const confirmDelete = (options: Omit<ConfirmOptions, "confirmVariant">) => {
    return confirm({
      confirmVariant: "destructive",
      confirmText: "Delete",
      title: "Delete item",
      description: "Are you sure? This action cannot be undone.",
      ...options,
    })
  }

  const confirmUpdate = (options: Omit<ConfirmOptions, "confirmVariant">) => {
    return confirm({
      confirmVariant: "default",
      confirmText: "Update",
      title: "Update item",
      description: "Confirm the changes?",
      ...options,
    })
  }

  const confirmCreate = (options: Omit<ConfirmOptions, "confirmVariant">) => {
    return confirm({
      confirmVariant: "default",
      confirmText: "Create",
      title: "Create new item",
      description: "Do you want to create this item?",
      ...options,
    })
  }

  return { confirm, confirmDelete, confirmUpdate, confirmCreate }
}
