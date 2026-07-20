// stores/confirmDialogStore.ts
import { create } from "zustand"

export interface ConfirmOptions {
  /** Dialog heading. */
  title?: string

  /** Body copy explaining what's being confirmed. */
  description?: string

  /** Label for the confirm button. Defaults to the preset used (see `useConfirmDialog`). */
  confirmText?: string

  /** Label for the cancel button. Defaults to `"Cancel"`. */
  cancelText?: string

  /** shadcn `Button` variant for the confirm button. Defaults to `"default"`; `useConfirmDialog`'s `confirmDelete` overrides this to `"destructive"`. */
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"

  /** Runs when the user clicks confirm, before the dialog closes and the `confirm()` promise resolves `true`. Put the actual side effect (the mutation) here. */
  onConfirm?: () => void | Promise<void>

  /** Runs when the user clicks cancel, before the dialog closes and the `confirm()` promise resolves `false`. */
  onCancel?: () => void | Promise<void>
}

interface ConfirmDialogState {
  isOpen: boolean
  options: ConfirmOptions
  resolve: ((value: boolean) => void) | null
  confirm: (options: ConfirmOptions) => Promise<boolean>
  handleConfirm: () => void
  handleCancel: () => void
  close: () => void
}

export const useConfirmDialogStore = create<ConfirmDialogState>((set, get) => ({
  isOpen: false,
  options: {},
  resolve: null,

  confirm: (options: ConfirmOptions) => {
    set({
      isOpen: true,
      options: {
        title: options.title,
        description: options.description,
        confirmText: options.confirmText,
        cancelText: options.cancelText || "Cancel",
        confirmVariant: options.confirmVariant || "default",
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      },
    })

    return new Promise<boolean>(resolve => {
      set({ resolve })
    })
  },

  handleConfirm: async () => {
    const { options, resolve, close } = get()
    if (options.onConfirm) await options.onConfirm()
    if (resolve) resolve(true)
    close()
  },

  handleCancel: async () => {
    const { options, resolve, close } = get()
    if (options.onCancel) await options.onCancel()
    if (resolve) resolve(false)
    close()
  },

  close: () => {
    set({ isOpen: false, resolve: null, options: {} })
  },
}))
