"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TableSkeleton } from "../skeletons/table-skeleton";
import { UserFilters } from "./user-filters";
import { UserDialog } from "./user-dialog";
import { ChangeRoleDialog } from "./change-role-dialog";
import { useUsers } from "@/hooks/use-admin-users";
import { format } from "date-fns";
import {
  Eye,
  MoreHorizontal,
  UserCog,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import type { UserRole, UserStatus } from "@/lib/generated/prisma";

type UserFromList = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  _count: {
    reviews: number;
  };
};

const statusColors: Record<UserStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  DELETED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const roleColors: Record<UserRole, string> = {
  USER: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PROVIDER: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  ADMIN: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export function UserTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });

  // State for dialogs
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roleDialogUser, setRoleDialogUser] = useState<UserFromList | null>(null);

  // Build query params
  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: filters.search || undefined,
      role: filters.role !== "all" ? (filters.role as UserRole) : undefined,
      status:
        filters.status !== "all" ? (filters.status as UserStatus) : undefined,
    }),
    [page, filters]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useUsers(queryParams);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setFilters({ search: "", role: "all", status: "all" });
    setPage(1);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Loading State */}
      {isLoading && <TableSkeleton columns={6} rows={10} showActions />}

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load users: {error?.message}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !isError && data?.users?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">No users found</p>
          {(filters.search || filters.role !== "all" || filters.status !== "all") && (
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          )}
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !isError && data?.users && data.users.length > 0 && (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.id}>
                    {/* User Cell */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.image ?? undefined}
                            alt={user.name}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role Cell */}
                    <TableCell>
                      <Badge className={roleColors[user.role]}>{user.role}</Badge>
                    </TableCell>

                    {/* Status Cell */}
                    <TableCell>
                      <Badge className={statusColors[user.status]}>
                        {user.status}
                      </Badge>
                    </TableCell>

                    {/* Reviews Cell */}
                    <TableCell className="text-center">
                      {user._count.reviews}
                    </TableCell>

                    {/* Joined Cell */}
                    <TableCell>
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </TableCell>

                    {/* Actions Cell */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setRoleDialogUser(user)}
                            disabled={user.role === "ADMIN"}
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                {(data.pagination.page - 1) * data.pagination.limit + 1} to{" "}
                {Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.total
                )}{" "}
                of {data.pagination.total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(data.pagination.totalPages, p + 1))
                  }
                  disabled={page === data.pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <UserDialog
        userId={selectedUserId}
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
      />

      {roleDialogUser && (
        <ChangeRoleDialog
          open={!!roleDialogUser}
          onOpenChange={(open) => !open && setRoleDialogUser(null)}
          user={roleDialogUser}
        />
      )}
    </div>
  );
}
