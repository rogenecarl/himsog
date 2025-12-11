"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import { useBulkUpdateAppointmentStatus } from "@/hooks/use-get-provider-appointment";
import type { AppointmentStatus } from "@/lib/generated/prisma";

interface BulkActionsBarProps {
  selectedIds: string[];
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  allSelected: boolean;
  disabled?: boolean;
}

export function BulkActionsBar({
  selectedIds,
  totalCount,
  onSelectAll,
  onClearSelection,
  allSelected,
  disabled = false,
}: BulkActionsBarProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const bulkUpdateMutation = useBulkUpdateAppointmentStatus();

  const handleBulkAction = (status: AppointmentStatus, reason?: string) => {
    bulkUpdateMutation.mutate(
      {
        appointmentIds: selectedIds,
        status,
        reason,
      },
      {
        onSuccess: () => {
          onClearSelection();
          setCancelDialogOpen(false);
          setCancelReason("");
        },
      }
    );
  };

  const handleConfirmSelected = () => {
    handleBulkAction("CONFIRMED");
  };

  const handleCompleteSelected = () => {
    handleBulkAction("COMPLETED");
  };

  const handleCancelSelected = () => {
    handleBulkAction("CANCELLED", cancelReason || "Cancelled by provider");
  };

  const isLoading = bulkUpdateMutation.isPending;

  if (selectedIds.length === 0 && !allSelected) {
    return null;
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-lg p-4 shadow-lg mb-6 animate-in slide-in-from-top-2 duration-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Selection info */}
          <div className="flex items-center gap-3">
            <button
              onClick={allSelected ? onClearSelection : onSelectAll}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              disabled={disabled || isLoading}
            >
              {allSelected ? (
                <CheckSquare className="h-5 w-5 text-cyan-500" />
              ) : (
                <Square className="h-5 w-5" />
              )}
              <span>
                {allSelected ? "Deselect All" : "Select All"}
              </span>
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-white/10" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {selectedIds.length} of {totalCount} selected
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfirmSelected}
              disabled={disabled || isLoading || selectedIds.length === 0}
              className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Confirm Selected
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCompleteSelected}
              disabled={disabled || isLoading || selectedIds.length === 0}
              className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Complete Selected
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelDialogOpen(true)}
              disabled={disabled || isLoading || selectedIds.length === 0}
              className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Selected
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isLoading}
              className="text-slate-600 dark:text-slate-400"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#1E293B]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              Cancel {selectedIds.length} Appointment{selectedIds.length > 1 ? "s" : ""}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              This will cancel all selected appointments and notify the patients.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-slate-900 dark:text-white">
                Cancellation Reason (Optional)
              </Label>
              <Textarea
                id="reason"
                placeholder="Enter a reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="resize-none bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setCancelReason("");
              }}
              disabled={isLoading}
            >
              Keep Appointments
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSelected}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Appointments
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Selection checkbox component for individual appointments
interface AppointmentCheckboxProps {
  appointmentId: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export function AppointmentCheckbox({
  appointmentId,
  isSelected,
  onToggle,
  disabled = false,
}: AppointmentCheckboxProps) {
  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={() => onToggle(appointmentId)}
      disabled={disabled}
      className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
    />
  );
}
