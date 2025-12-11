"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useDeleteService } from "@/hooks/use-provider-services-hook";
import { Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: { id: string; name: string } | null;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  service,
}: DeleteConfirmDialogProps) {
  const deleteServiceMutation = useDeleteService();

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!service) return;

    try {
      await deleteServiceMutation.mutateAsync(service.id);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation hook
      console.log(error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing while deletion is in progress
    if (deleteServiceMutation.isPending) return;
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 dark:text-white">Delete Service</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
            Are you sure you want to delete <strong>{service?.name}</strong>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={deleteServiceMutation.isPending}
            className="border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteServiceMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {deleteServiceMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
