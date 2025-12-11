"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUpdateProviderStatus } from "@/hooks/use-admin-get-provider";
import {
  Loader2,
  CheckCircle2,
  Clock,
  Ban,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import type { ProviderStatus } from "@/lib/generated/prisma";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: {
    id: string;
    healthcareName: string;
    status: ProviderStatus;
  };
}

const statusOptions: Array<{
  value: ProviderStatus;
  label: string;
  requiresReason: boolean;
  icon: React.ElementType;
  color: string;
  description: string;
}> = [
  {
    value: "PENDING",
    label: "Pending",
    requiresReason: false,
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    description: "Provider is awaiting verification",
  },
  {
    value: "VERIFIED",
    label: "Verified",
    requiresReason: false,
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    description: "Provider is verified and can accept appointments",
  },
  {
    value: "SUSPENDED",
    label: "Suspended",
    requiresReason: true,
    icon: Ban,
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    description: "Provider access is temporarily restricted",
  },
  {
    value: "REJECTED",
    label: "Rejected",
    requiresReason: true,
    icon: XCircle,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    description: "Provider application has been rejected",
  },
];

export function StatusChangeDialog({
  open,
  onOpenChange,
  provider,
}: StatusChangeDialogProps) {
  const [newStatus, setNewStatus] = useState<ProviderStatus>(provider.status);
  const [reason, setReason] = useState("");
  const [sendNotification, setSendNotification] = useState(true);

  const { mutate: updateStatus, isPending } = useUpdateProviderStatus();

  // Reset form when provider changes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset state when dialog opens
      setNewStatus(provider.status);
      setReason("");
      setSendNotification(true);
    }
    onOpenChange(newOpen);
  };

  const selectedOption = statusOptions.find((o) => o.value === newStatus);
  const currentOption = statusOptions.find((o) => o.value === provider.status);
  const requiresReason = selectedOption?.requiresReason ?? false;

  const handleSubmit = () => {
    updateStatus(
      {
        providerId: provider.id,
        status: newStatus,
        reason: requiresReason ? reason.trim() : undefined,
        sendNotification,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReason("");
        },
      }
    );
  };

  const isValid =
    newStatus !== provider.status &&
    (!requiresReason || reason.trim().length >= 10);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Provider Status</DialogTitle>
          <DialogDescription>
            Update the verification status for{" "}
            <span className="font-medium">{provider.healthcareName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Current Status</Label>
            <div className="flex items-center gap-2">
              {currentOption && (
                <>
                  <currentOption.icon className="h-4 w-4" />
                  <Badge className={currentOption.color}>
                    {currentOption.label}
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* New Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select
              value={newStatus}
              onValueChange={(value) => setNewStatus(value as ProviderStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedOption && (
              <p className="text-xs text-muted-foreground">
                {selectedOption.description}
              </p>
            )}
          </div>

          {/* Reason Input (for Suspended/Rejected) */}
          {requiresReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder={`Please provide a detailed reason for ${newStatus.toLowerCase()} this provider (minimum 10 characters)...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {reason.length}/10 characters minimum
              </p>
            </div>
          )}

          {/* Warning Messages */}
          {newStatus === "SUSPENDED" && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> Suspending this provider will:
                  <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                    <li>Hide them from search results</li>
                    <li>Prevent new appointments from being booked</li>
                    <li>Notify the provider about the suspension</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {newStatus === "REJECTED" && (
            <div className="rounded-md bg-gray-50 dark:bg-gray-900/20 p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div className="text-gray-800 dark:text-gray-200">
                  <strong>Note:</strong> Rejecting this provider will:
                  <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                    <li>Remove them from the platform</li>
                    <li>Notify the provider about the rejection</li>
                    <li>They may need to reapply</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {newStatus === "VERIFIED" && provider.status === "PENDING" && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="text-green-800 dark:text-green-200">
                  <strong>Verification:</strong> Approving this provider will:
                  <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                    <li>Make them visible in search results</li>
                    <li>Allow them to receive appointments</li>
                    <li>Send a congratulations notification</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Notification Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notification"
              checked={sendNotification}
              onCheckedChange={(checked) =>
                setSendNotification(checked as boolean)
              }
            />
            <Label htmlFor="notification" className="text-sm font-normal">
              Send notification to provider about this status change
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !isValid}
            variant={
              newStatus === "SUSPENDED" || newStatus === "REJECTED"
                ? "destructive"
                : "default"
            }
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
