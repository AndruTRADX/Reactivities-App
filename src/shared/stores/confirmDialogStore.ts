// stores/confirmDialogStore.ts
import { create } from "zustand"

export interface ConfirmOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  onConfirm?: () => void | Promise<void>
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
