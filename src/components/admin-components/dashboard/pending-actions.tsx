"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingActions } from "@/hooks/use-admin-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, FileText, ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";

export function PendingActions() {
  const { data, isLoading, isError, refetch } = usePendingActions();

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36 bg-slate-200 dark:bg-white/10" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-4 w-40 bg-slate-200 dark:bg-white/10" />
              </div>
              <Skeleton className="h-6 w-8 rounded-full bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const pendingItems = [
    {
      label: "Providers awaiting verification",
      count: data?.pendingProviders ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      badgeColor: "bg-yellow-500 hover:bg-yellow-600",
      href: "/admin/providers?status=PENDING",
    },
    {
      label: "Documents need review",
      count: data?.pendingDocuments ?? 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      badgeColor: "bg-blue-500 hover:bg-blue-600",
      href: "/admin/providers",
    },
    {
      label: "Unresolved feedback",
      count: data?.unresolvedFeedback ?? 0,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      badgeColor: "bg-orange-500 hover:bg-orange-600",
      href: "/admin/feedback?resolved=false",
    },
  ];

  const totalPending =
    (data?.pendingProviders ?? 0) +
    (data?.pendingDocuments ?? 0) +
    (data?.unresolvedFeedback ?? 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          Pending Actions
        </CardTitle>
        {totalPending > 0 && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            {totalPending} total
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${item.bgColor}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <span className="text-sm">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={item.count > 0 ? "default" : "secondary"}
                className={item.count > 0 ? item.badgeColor : ""}
              >
                {item.count}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}

        {totalPending === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">All caught up! No pending actions.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
