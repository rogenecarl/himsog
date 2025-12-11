"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/hooks/use-admin-users";
import { ChangeRoleDialog } from "./change-role-dialog";
import { format } from "date-fns";
import {
  Mail,
  Calendar,
  AlertCircle,
  Building2,
  UserCog,
} from "lucide-react";
import type { UserRole, UserStatus } from "@/lib/generated/prisma";

interface UserDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

function UserDialogSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-40 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-4 w-56 bg-slate-200 dark:bg-white/10" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-5 w-20 bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Details Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UserDialog({ userId, open, onOpenChange }: UserDialogProps) {
  const { data: user, isLoading, isError, error } = useUser(userId);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
            <div className="pt-4">
              {isLoading && <UserDialogSkeleton />}

              {isError && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <p className="text-destructive font-medium">
                    Failed to load user details
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error?.message}
                  </p>
                </div>
              )}

              {user && (
                <div className="space-y-6">
                  {/* User Header */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.image ?? undefined} alt={user.name} />
                      <AvatarFallback className="text-lg">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge className={roleColors[user.role]}>{user.role}</Badge>
                        <Badge className={statusColors[user.status]}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* User Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="truncate">{user.email}</span>
                      {user.emailVerified && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Joined:</span>
                      <span>{format(new Date(user.createdAt), "PPP")}</span>
                    </div>
                    {user.provider && (
                      <div className="flex items-center gap-3 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Provider:</span>
                        <span className="truncate">{user.provider.healthcareName}</span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {user.provider.status}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Suspension Info */}
                  {user.status === "SUSPENDED" && user.suspendReason && (
                    <>
                      <Separator />
                      <div className="rounded-md bg-destructive/10 p-3 text-sm">
                        <p className="font-medium text-destructive mb-1">
                          Suspension Reason
                        </p>
                        <p className="text-muted-foreground">
                          {user.suspendReason}
                        </p>
                        {user.suspendedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Suspended on{" "}
                            {format(new Date(user.suspendedAt), "PPP 'at' p")}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setRoleDialogOpen(true)}
                      disabled={user.role === "ADMIN"}
                    >
                      <UserCog className="h-4 w-4 mr-2" />
                      Change Role
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      {user && (
        <ChangeRoleDialog
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          user={user}
        />
      )}
    </>
  );
}
