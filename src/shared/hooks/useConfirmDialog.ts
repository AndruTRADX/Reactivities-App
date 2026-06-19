import { useConfirmDialogStore } from "@/shared/stores/confirmDialogStore";
import type { ConfirmOptions } from "@/shared/stores/confirmDialogStore";

export const useConfirmDialog = () => {
  const confirm = useConfirmDialogStore((state) => state.confirm);

  const confirmDelete = (options: Omit<ConfirmOptions, 'confirmVariant' >) => {
    return confirm({
      confirmVariant: 'destructive',
      confirmText: 'Delete',
      title: 'Delete item',
      description: 'Are you sure? This action cannot be undone.',
      ...options,
    });
  };

  const confirmUpdate = (options: Omit<ConfirmOptions, 'confirmVariant'>) => {
    return confirm({
      confirmVariant: 'default',
      confirmText: 'Update',
      title: 'Update item',
      description: 'Confirm the changes?',
      ...options,
    });
  };

  const confirmCreate = (options: Omit<ConfirmOptions, 'confirmVariant'>) => {
    return confirm({
      confirmVariant: 'default',
      confirmText: 'Create',
      title: 'Create new item',
      description: 'Do you want to create this item?',
      ...options,
    });
  };

  return { confirm, confirmDelete, confirmUpdate, confirmCreate };
};