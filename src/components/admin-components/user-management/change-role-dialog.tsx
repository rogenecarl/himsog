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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateUserRole } from "@/hooks/use-admin-users";
import { Loader2, Shield, User, Building2 } from "lucide-react";
import type { UserRole } from "@/lib/generated/prisma";

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

const roleOptions = [
  {
    value: "USER",
    label: "User",
    description: "Regular user with basic access",
    icon: User,
  },
  {
    value: "PROVIDER",
    label: "Provider",
    description: "Healthcare provider with provider dashboard access",
    icon: Building2,
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Full administrative access",
    icon: Shield,
  },
];

export function ChangeRoleDialog({
  open,
  onOpenChange,
  user,
}: ChangeRoleDialogProps) {
  const [newRole, setNewRole] = useState<UserRole>(user.role);
  const { mutate: updateRole, isPending } = useUpdateUserRole();

  const handleSubmit = () => {
    updateRole(
      { userId: user.id, newRole },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const selectedRoleInfo = roleOptions.find((r) => r.value === newRole);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for <span className="font-medium">{user.name}</span>{" "}
            ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Role</Label>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {(() => {
                const CurrentIcon =
                  roleOptions.find((r) => r.value === user.role)?.icon || User;
                return <CurrentIcon className="h-4 w-4" />;
              })()}
              <span>{user.role}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">New Role</Label>
            <Select
              value={newRole}
              onValueChange={(value) => setNewRole(value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoleInfo && (
              <p className="text-xs text-muted-foreground">
                {selectedRoleInfo.description}
              </p>
            )}
          </div>

          {newRole === "ADMIN" && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> Admin users have full access to all
              platform features and data. Only assign this role to trusted
              individuals.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || newRole === user.role}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
