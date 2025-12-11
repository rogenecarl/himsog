"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Layers,
  Star,
  Activity,
  Settings,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

const actions = [
  {
    href: "/provider/appointments",
    icon: Calendar,
    label: "Appointments",
    description: "Online bookings",
    bgColor: "bg-cyan-500 hover:bg-cyan-600",
  },
  {
    href: "/provider/services",
    icon: Layers,
    label: "Manage Services",
    description: "Add/edit services",
    bgColor: "bg-yellow-500 hover:bg-yellow-600",
  },
  {
    href: "/provider/calendar",
    icon: Calendar,
    label: "Calendar",
    description: "View schedule",
    bgColor: "bg-green-500 hover:bg-green-600",
  },
  {
    href: "/provider/reviews",
    icon: Star,
    label: "Reviews",
    description: "Customer feedback",
    bgColor: "bg-blue-500 hover:bg-blue-600",
  },
  {
    href: "/provider/settings",
    icon: Settings,
    label: "Settings",
    description: "Configure profile",
    bgColor: "bg-orange-500 hover:bg-orange-600",
  },
  {
    href: "/provider/analytics",
    icon: BarChart3,
    label: "Analytics",
    description: "Business insights",
    bgColor: "bg-gradient-to-br from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600",
  },
];

export function QuickActions() {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
          <Activity className="h-5 w-5 text-cyan-500" />
          Quick Actions
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage your healthcare operations
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {actions.map(({ href, icon: Icon, label, description, bgColor }) => (
            <Link key={href} href={href}>
              <Button
                variant="outline"
                className={`h-20 sm:h-24 w-full flex flex-col items-center justify-center gap-1 sm:gap-2 ${bgColor} text-white border-none`}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-semibold">{label}</p>
                  <p className="text-[10px] sm:text-xs opacity-90 hidden sm:block">{description}</p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
