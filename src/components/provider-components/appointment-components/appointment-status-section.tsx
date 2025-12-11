"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppointmentCard } from "./appointment-card"
import { AppointmentStatus } from "@/lib/generated/prisma"

const ClockIcon = () => (
  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8v4l3 1m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

interface AppointmentStatusSectionProps {
  status: AppointmentStatus
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  borderColor: string
  emptyMessage: string
  emptySubMessage: string
  appointments: Array<{
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
  }>
  onApprove: (id: string) => void
  onCancel?: (id: string, reason: string, notes?: string) => void
  onStatusChange?: (id: string, status: AppointmentStatus, activityNotes?: string) => void
  approvingId?: string | null
  completingId?: string | null
  cancellingId?: string | null
  // Bulk selection props
  selectedIds?: string[]
  onSelect?: (id: string) => void
  showCheckboxes?: boolean
}

export function AppointmentStatusSection({
  status,
  title,
  description,
  icon: Icon,
  bgColor,
  borderColor,
  emptyMessage,
  emptySubMessage,
  appointments,
  onApprove,
  onCancel,
  onStatusChange,
  approvingId,
  completingId,
  cancellingId,
  selectedIds = [],
  onSelect,
  showCheckboxes = false,
}: AppointmentStatusSectionProps) {
  const sectionAppointments = appointments.filter((apt) => apt.status === status)

  return (
    <Card className={`${bgColor} border ${borderColor}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon />
          <div>
            <CardTitle className="text-lg">
              {title} ({sectionAppointments.length})
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sectionAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ClockIcon />
            <p className="font-semibold text-slate-900 dark:text-white mt-4">{emptyMessage}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{emptySubMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sectionAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onApprove={onApprove}
                onCancel={onCancel}
                onStatusChange={onStatusChange}
                isApproving={approvingId === apt.id}
                isCompleting={completingId === apt.id}
                isCancelling={cancellingId === apt.id}
                isSelected={selectedIds.includes(apt.id)}
                onSelect={onSelect}
                showCheckbox={showCheckboxes}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
