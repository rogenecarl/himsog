import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  suspendUser,
  reactivateUser,
  deleteUser,
  getUserStatistics,
  type UserQueryParams,
} from "@/actions/admin/user-actions";
import type { UserRole } from "@/lib/generated/prisma";
import { toast } from "sonner";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const userKeys = {
  all: ["admin", "users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UserQueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  statistics: () => [...userKeys.all, "statistics"] as const,
};

// ============================================================================
// GET ALL USERS
// ============================================================================

export function useUsers(params: UserQueryParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const result = await getAllUsers(params);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

// ============================================================================
// GET USER BY ID
// ============================================================================

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: userKeys.detail(userId ?? ""),
    queryFn: async () => {
      if (!userId) return null;
      const result = await getUserById(userId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!userId,
  });
}

// ============================================================================
// GET USER STATISTICS
// ============================================================================

export function useUserStatistics() {
  return useQuery({
    queryKey: userKeys.statistics(),
    queryFn: async () => {
      const result = await getUserStatistics();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 60000, // 1 minute
  });
}

// ============================================================================
// UPDATE USER ROLE
// ============================================================================

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: UserRole;
    }) => {
      const result = await updateUserRole(userId, newRole);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onMutate: async ({ userId, newRole }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });

      // Snapshot previous value
      const previousData = queryClient.getQueriesData({
        queryKey: userKeys.lists(),
      });

      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: userKeys.lists() },
        (old: { users: Array<{ id: string; role: UserRole }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            users: old.users.map((user) =>
              user.id === userId ? { ...user, role: newRole } : user
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.message || "Failed to update user role");
    },
    onSuccess: (result) => {
      toast.success(result.message || "User role updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

// ============================================================================
// SUSPEND USER
// ============================================================================

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason: string;
    }) => {
      const result = await suspendUser(userId, reason);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });

      const previousData = queryClient.getQueriesData({
        queryKey: userKeys.lists(),
      });

      // Optimistic update
      queryClient.setQueriesData(
        { queryKey: userKeys.lists() },
        (old: { users: Array<{ id: string; status: string }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            users: old.users.map((user) =>
              user.id === userId ? { ...user, status: "SUSPENDED" } : user
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.message || "Failed to suspend user");
    },
    onSuccess: (result) => {
      toast.success(result.message || "User suspended successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

// ============================================================================
// REACTIVATE USER
// ============================================================================

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const result = await reactivateUser(userId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });

      const previousData = queryClient.getQueriesData({
        queryKey: userKeys.lists(),
      });

      // Optimistic update
      queryClient.setQueriesData(
        { queryKey: userKeys.lists() },
        (old: { users: Array<{ id: string; status: string }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            users: old.users.map((user) =>
              user.id === userId ? { ...user, status: "ACTIVE" } : user
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.message || "Failed to reactivate user");
    },
    onSuccess: (result) => {
      toast.success(result.message || "User reactivated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

// ============================================================================
// DELETE USER
// ============================================================================

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason: string;
    }) => {
      const result = await deleteUser(userId, reason);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete user");
    },
    onSuccess: (result) => {
      toast.success(result.message || "User deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
