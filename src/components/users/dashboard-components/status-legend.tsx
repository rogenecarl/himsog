"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function StatusLegend() {
  const statuses = [
    {
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      dot: "bg-yellow-500",
      description: "Awaiting confirmation",
    },
    {
      label: "Confirmed",
      color: "bg-green-100 text-green-800 border-green-200",
      dot: "bg-green-500",
      description: "Appointment confirmed",
    },
    {
      label: "Completed",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      dot: "bg-blue-500",
      description: "Visit completed",
    },
    {
      label: "Cancelled",
      color: "bg-red-100 text-red-800 border-red-200",
      dot: "bg-red-500",
      description: "Appointment cancelled",
    },
  ]

  return (
    <Card className="bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base dark:text-white">Appointment Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {statuses.map((status) => (
          <div key={status.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className={`w-3 h-3 rounded-full ${status.dot} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{status.label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{status.description}</p>
              </div>
            </div>
            <Badge variant="outline" className={`${status.color} border text-xs`}>
              {status.label}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
