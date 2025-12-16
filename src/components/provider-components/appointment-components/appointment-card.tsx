"use client"

import { useState, useEffect, useRef } from "react"
import { AppointmentStatus } from "@/lib/generated/prisma"
import { Loader2, Calendar, Clock, Check, X, Eye, Phone, Hash, FileText, CreditCard, User } from "lucide-react"
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
    notes?: string | null
    services?: Array<{
      service: {
        id: string
        name: string
        description: string | null
      }
      priceAtBooking?: number
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
  // Highlight prop for calendar navigation
  isHighlighted?: boolean
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
  isHighlighted = false,
}: AppointmentCardProps) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
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

  const serviceCount = appointment.services?.length || 0
  const isPending = appointment.status === "PENDING"

  const getStatusBadgeForDialog = (status: AppointmentStatus) => {
    const statusConfig = {
      PENDING: {
        bg: "bg-orange-50 dark:bg-orange-950/50",
        text: "text-orange-700 dark:text-orange-300",
        border: "border-orange-100 dark:border-orange-800",
        dot: "bg-orange-500",
      },
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
      NO_SHOW: {
        bg: "bg-red-50 dark:bg-red-950/50",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-800",
        dot: "bg-red-500",
      },
    }

    const config = statusConfig[status]
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
        {status.replace("_", " ")}
      </span>
    )
  }

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
      id={`appointment-${appointment.id}`}
      className={`bg-white dark:bg-[#1E293B] rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 p-5 mb-4 group ${
        isHighlighted
          ? "border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/30 dark:ring-cyan-400/30 animate-pulse"
          : isSelected
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

        {/* Patient Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border-2 border-gray-100 dark:border-gray-700 shadow-sm shrink-0">
            <span className="text-indigo-700 dark:text-indigo-300 font-bold text-base">
              {appointment.patientName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white text-base leading-tight truncate">
              {appointment.patientName}
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                <span>{formatDate(appointment.startTime)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                <span>{formatTime(appointment.startTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Details Button */}
          <button
            onClick={() => setShowDetailsDialog(true)}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="View details"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>

          {isPending ? (
            <div className="flex items-center gap-2">
              {onCancel && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isCancelling}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              )}
              <button
                onClick={() => onApprove(appointment.id)}
                disabled={isApproving}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApproving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{isApproving ? "Approving..." : "Approve"}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {appointment.status === "CONFIRMED" && onStatusChange && (
                <button
                  onClick={() => setShowCompleteDialog(true)}
                  disabled={isCompleting}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Complete</span>
                </button>
              )}
            </div>
          )}
        </div>
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

      {/* View Appointment Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Appointment Details
            </DialogTitle>
            <DialogDescription>
              Complete information for this appointment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status and Appointment Number */}
            <div className="flex items-center justify-between">
              {getStatusBadgeForDialog(appointment.status)}
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Hash className="w-4 h-4" />
                <span className="font-mono">{appointment.appointmentNumber}</span>
              </div>
            </div>

            {/* Patient Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Patient Information
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Name</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {appointment.patientName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                  <a
                    href={`mailto:${appointment.patientEmail}`}
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {appointment.patientEmail}
                  </a>
                </div>
                {appointment.patientPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                    <a
                      href={`tel:${appointment.patientPhone}`}
                      className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {appointment.patientPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Schedule
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(appointment.startTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Time</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Services ({serviceCount})
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                {appointment.services?.map((s, index) => (
                  <div
                    key={s.service.id}
                    className={`flex items-start justify-between ${
                      index !== 0 ? "pt-3 border-t border-gray-200 dark:border-gray-700" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {s.service.name}
                      </p>
                      {s.service.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {s.service.description}
                        </p>
                      )}
                    </div>
                    {s.priceAtBooking !== undefined && (
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-4">
                        ₱{s.priceAtBooking.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <CreditCard className="w-4 h-4 text-gray-400" />
                Total Amount
              </div>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                ₱{appointment.totalPrice.toLocaleString()}
              </span>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Patient Notes
                </h4>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {appointment.notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>

            {/* Action buttons based on status */}
            {isPending && (
              <>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDetailsDialog(false)
                      setShowCancelDialog(true)
                    }}
                    className="w-full sm:w-auto text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Cancel Appointment
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => {
                    onApprove(appointment.id)
                    setShowDetailsDialog(false)
                  }}
                  disabled={isApproving}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  {isApproving ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-1.5" />
                  )}
                  {isApproving ? "Approving..." : "Approve"}
                </Button>
              </>
            )}

            {appointment.status === "CONFIRMED" && onStatusChange && (
              <Button
                type="button"
                onClick={() => {
                  setShowDetailsDialog(false)
                  setShowCompleteDialog(true)
                }}
                disabled={isCompleting}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Mark as Complete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
