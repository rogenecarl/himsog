"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  History,
  X,
} from "lucide-react";
import { useAuditLogs } from "@/hooks/use-admin-settings";
import { AUDIT_ACTIONS } from "@/actions/admin/audit-constants";
import { format, formatDistanceToNow } from "date-fns";
import type { AuditLogQueryParams } from "@/actions/admin/audit-actions";

// ============================================================================
// TYPES
// ============================================================================

type AuditLog = {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  oldValue: unknown;
  newValue: unknown;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  admin: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

// ============================================================================
// HELPERS
// ============================================================================

const actionColors: Record<string, string> = {
  PROVIDER_STATUS_CHANGED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  PROVIDER_DOCUMENT_VERIFIED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  PROVIDER_DOCUMENT_REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  USER_ROLE_CHANGED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  USER_SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  USER_REACTIVATED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  USER_DELETED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  CATEGORY_CREATED: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  CATEGORY_UPDATED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  CATEGORY_DELETED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  CATEGORY_STATUS_TOGGLED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  SETTINGS_UPDATED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
};

const targetTypeColors: Record<string, string> = {
  Provider: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
  User: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  Category: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300",
  Document: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
  Settings: "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300",
};

function formatActionName(action: string): string {
  return action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

// ============================================================================
// TABLE SKELETON
// ============================================================================

function AuditLogTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-4 w-16 bg-slate-200 dark:bg-white/10" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20 bg-slate-200 dark:bg-white/10" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16 bg-slate-200 dark:bg-white/10" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20 bg-slate-200 dark:bg-white/10" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full bg-slate-200 dark:bg-white/10" />
                  <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 bg-slate-200 dark:bg-white/10" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20 bg-slate-200 dark:bg-white/10" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================================
// FILTERS
// ============================================================================

interface FiltersProps {
  filters: AuditLogQueryParams;
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
}

function AuditLogFilters({ filters, onFilterChange, onClear }: FiltersProps) {
  const actionOptions = Object.values(AUDIT_ACTIONS);
  const targetTypeOptions = ["Provider", "User", "Category", "Document", "Settings"];

  const hasFilters = filters.action || filters.targetType;

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Select
        value={filters.action ?? "all"}
        onValueChange={(value) => onFilterChange("action", value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actions</SelectItem>
          {actionOptions.map((action) => (
            <SelectItem key={action} value={action}>
              {formatActionName(action)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.targetType ?? "all"}
        onValueChange={(value) => onFilterChange("targetType", value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Target type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {targetTypeOptions.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AuditLogTable() {
  const [filters, setFilters] = useState<AuditLogQueryParams>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading, isError, error, refetch } = useAuditLogs(filters);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
      page: 1, // Reset to first page when filtering
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 20 });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Logs
          </CardTitle>
          <CardDescription>View all administrative actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-[200px] bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-10 w-[150px] bg-slate-200 dark:bg-white/10" />
          </div>
          <AuditLogTableSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load audit logs: {error?.message}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Audit Logs
        </CardTitle>
        <CardDescription>
          View all administrative actions performed on the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <AuditLogFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Table */}
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No audit logs found</p>
            {(filters.action || filters.targetType) && (
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: AuditLog) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={log.admin.image ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {log.admin.name?.charAt(0).toUpperCase() ?? "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {log.admin.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {log.admin.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={actionColors[log.action] ?? ""}
                      >
                        {formatActionName(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          variant="outline"
                          className={targetTypeColors[log.targetType] ?? ""}
                        >
                          {log.targetType}
                        </Badge>
                        <p className="text-xs text-muted-foreground font-mono">
                          {log.targetId.slice(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground font-mono">
                        {log.ipAddress ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">
                          {format(new Date(log.createdAt), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} logs
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
