"use client"

import { useState, useEffect, useRef } from "react"
import { AppointmentStatus } from "@/lib/generated/prisma"
import { Loader2, Calendar, Clock, Mail, Check, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PROVIDER_CANCELLATION_REASONS } from "@/lib/constants/cancellation-reasons"

interface AppointmentCardProps {
  appointment: {
    id: string
    appointmentNumber: string
    patientName: string
    patientEmail: string
    patientPhone: string | null
    startTime: Date
    endTime: Date
    status: AppointmentStatus
    totalPrice: number
    services?: Array<{
      service: {
        id: string
        name: string
        description: string | null
      }
    }>
  }
  onApprove: (id: string) => void
  onCancel?: (id: string, reason: string, notes?: string) => void
  onStatusChange?: (id: string, status: AppointmentStatus, activityNotes?: string) => void
  isApproving?: boolean
  isCompleting?: boolean
  isCancelling?: boolean
  // Bulk selection props
  isSelected?: boolean
  onSelect?: (id: string) => void
  showCheckbox?: boolean
}

export function AppointmentCard({
  appointment,
  onApprove,
  onCancel,
  onStatusChange,
  isApproving = false,
  isCompleting = false,
  isCancelling = false,
  isSelected = false,
  onSelect,
  showCheckbox = false,
}: AppointmentCardProps) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [activityNotes, setActivityNotes] = useState("")
  const [cancelReason, setCancelReason] = useState("")
  const [cancelNotes, setCancelNotes] = useState("")

  // Track previous isCompleting state to detect when it finishes
  const wasCompleting = useRef(false)
  const wasCancelling = useRef(false)

  // Close dialog when completing finishes (isCompleting goes from true to false)
  useEffect(() => {
    if (wasCompleting.current && !isCompleting && showCompleteDialog) {
      // Defer state update to avoid calling setState synchronously in effect
      queueMicrotask(() => {
        setShowCompleteDialog(false)
        setActivityNotes("")
      })
    }
    wasCompleting.current = isCompleting
  }, [isCompleting, showCompleteDialog])

  // Close dialog when cancelling finishes (isCancelling goes from true to false)
  useEffect(() => {
    if (wasCancelling.current && !isCancelling && showCancelDialog) {
      // Defer state update to avoid calling setState synchronously in effect
      queueMicrotask(() => {
        setShowCancelDialog(false)
        setCancelReason("")
        setCancelNotes("")
      })
    }
    wasCancelling.current = isCancelling
  }, [isCancelling, showCancelDialog])

  const handleCompleteSubmit = () => {
    if (onStatusChange) {
      onStatusChange(appointment.id, "COMPLETED", activityNotes || undefined)
      // Don't close dialog here - let it stay open with loading state
      // Dialog will close via useEffect when isCompleting becomes false
    }
  }

  const handleDialogClose = () => {
    if (!isCompleting) {
      setShowCompleteDialog(false)
      setActivityNotes("")
    }
  }

  const handleCancelSubmit = () => {
    if (onCancel && cancelReason) {
      onCancel(appointment.id, cancelReason, cancelNotes || undefined)
    }
  }

  const handleCancelDialogClose = () => {
    if (!isCancelling) {
      setShowCancelDialog(false)
      setCancelReason("")
      setCancelNotes("")
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const serviceName = appointment.services?.[0]?.service?.name || "Service"
  const isPending = appointment.status === "PENDING"

  const getStatusBadge = () => {
    const statusConfig = {
      CONFIRMED: {
        bg: "bg-blue-50 dark:bg-blue-950/50",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-100 dark:border-blue-800",
        dot: "bg-blue-500",
      },
      COMPLETED: {
        bg: "bg-green-50 dark:bg-green-950/50",
        text: "text-green-700 dark:text-green-300",
        border: "border-green-100 dark:border-green-800",
        dot: "bg-green-500",
      },
      CANCELLED: {
        bg: "bg-gray-50 dark:bg-gray-800/50",
        text: "text-gray-600 dark:text-gray-400",
        border: "border-gray-200 dark:border-gray-700",
        dot: "bg-gray-400",
      },
    }

    const config = statusConfig[appointment.status as keyof typeof statusConfig]
    if (!config) return null

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
        {appointment.status}
      </span>
    )
  }

  return (
    <div
      className={`bg-white dark:bg-[#1E293B] rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-300 p-5 mb-4 group ${
        isSelected
          ? "border-cyan-500 dark:border-cyan-400 ring-1 ring-cyan-500/20 dark:ring-cyan-400/20"
          : "border-gray-200 dark:border-white/10"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Selection Checkbox */}
        {showCheckbox && onSelect && (
          <div className="flex items-center self-start md:self-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(appointment.id)}
              className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
            />
          </div>
        )}

        {/* User Info */}
        <div className="flex items-start gap-4 md:w-1/3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border-2 border-gray-100 dark:border-gray-700 shadow-sm">
            <span className="text-indigo-700 dark:text-indigo-300 font-bold text-lg">
              {appointment.patientName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
              {appointment.patientName}
            </h4>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              <a
                href={`mailto:${appointment.patientEmail}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {appointment.patientEmail}
              </a>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="flex flex-col gap-2 md:w-1/3">
          <div className="flex items-center">
            <span className="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 truncate max-w-[200px]">
              {serviceName}
            </span>
            <span className="ml-3 text-sm font-bold text-gray-700 dark:text-gray-300">
              ₱{appointment.totalPrice}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500" />
              <span>{formatDate(appointment.startTime)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500" />
              <span>
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isPending ? (
          <div className="flex flex-col sm:flex-row gap-3 md:w-auto w-full mt-2 md:mt-0">
            {onCancel && (
              <button
                onClick={() => setShowCancelDialog(true)}
                disabled={isCancelling}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-transparent transition-colors focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
            <button
              onClick={() => onApprove(appointment.id)}
              disabled={isApproving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200 dark:shadow-green-900/30 transition-all transform active:scale-95 focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isApproving ? "Approving..." : "Approve"}
            </button>
          </div>
        ) : (
          <div className="md:w-auto w-full flex flex-col sm:flex-row items-end sm:items-center gap-3 justify-end">
            {getStatusBadge()}
            {/* Mark as Complete button for CONFIRMED appointments */}
            {appointment.status === "CONFIRMED" && onStatusChange && (
              <button
                onClick={() => setShowCompleteDialog(true)}
                disabled={isCompleting}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-transparent transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Mark as Complete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Complete Appointment Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Appointment</DialogTitle>
            <DialogDescription>
              Add an activity summary for {appointment.patientName}. This will be sent to the patient.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="activity-notes">Activity Summary (Optional)</Label>
              <Textarea
                id="activity-notes"
                placeholder="e.g., General checkup completed. Blood pressure normal. Follow-up in 3 months."
                value={activityNotes}
                onChange={(e) => setActivityNotes(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isCompleting}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
              disabled={isCompleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCompleteSubmit}
              disabled={isCompleting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Completing...
                </>
              ) : (
                "Complete Appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Appointment Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={handleCancelDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling {appointment.patientName}&apos;s appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason for cancellation</Label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger id="cancel-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_CANCELLATION_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancel-notes">Additional notes (Optional)</Label>
              <Textarea
                id="cancel-notes"
                placeholder="Any additional details for the patient..."
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isCancelling}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDialogClose}
              disabled={isCancelling}
            >
              Keep Appointment
            </Button>
            <Button
              type="button"
              onClick={handleCancelSubmit}
              disabled={isCancelling || !cancelReason}
              variant="destructive"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelling...
                </>
              ) : (
                "Cancel Appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
