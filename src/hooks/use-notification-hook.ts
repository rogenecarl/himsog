import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationsWithCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type NotificationData,
  type NotificationsResponse,
} from "@/actions/notifications/create-notification-actions";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

// ============================================================================
// NOTIFICATIONS QUERY
// ============================================================================

export function useNotifications() {
  const queryClient = useQueryClient();

  // Fetch notifications and count in a single query
  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const result = await getNotificationsWithCount();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch notifications");
      }
      return result.data;
    },
    staleTime: 30000, // 30 seconds - data considered fresh
    refetchInterval: 30000, // Poll every 30 seconds instead of 10
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  // Mark single notification as read with optimistic update
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<NotificationsResponse>(
        notificationKeys.list()
      );

      // Optimistically update
      queryClient.setQueryData<NotificationsResponse>(
        notificationKeys.list(),
        (old) => {
          if (!old) return old;
          const notification = old.notifications.find(
            (n) => n.id === notificationId
          );
          const wasUnread = notification && !notification.isRead;

          return {
            notifications: old.notifications.map((n) =>
              n.id === notificationId
                ? { ...n, isRead: true, readAt: new Date() }
                : n
            ),
            unreadCount: wasUnread
              ? Math.max(0, old.unreadCount - 1)
              : old.unreadCount,
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _notificationId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(notificationKeys.list(), context.previousData);
      }
    },
  });

  // Mark all notifications as read with optimistic update
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });

      const previousData = queryClient.getQueryData<NotificationsResponse>(
        notificationKeys.list()
      );

      queryClient.setQueryData<NotificationsResponse>(
        notificationKeys.list(),
        (old) => {
          if (!old) return old;
          return {
            notifications: old.notifications.map((n) => ({
              ...n,
              isRead: true,
              readAt: n.readAt ?? new Date(),
            })),
            unreadCount: 0,
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(notificationKeys.list(), context.previousData);
      }
    },
  });

  // Delete notification with optimistic update
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });

      const previousData = queryClient.getQueryData<NotificationsResponse>(
        notificationKeys.list()
      );

      queryClient.setQueryData<NotificationsResponse>(
        notificationKeys.list(),
        (old) => {
          if (!old) return old;
          const deletedNotification = old.notifications.find(
            (n) => n.id === notificationId
          );
          const wasUnread = deletedNotification && !deletedNotification.isRead;

          return {
            notifications: old.notifications.filter(
              (n) => n.id !== notificationId
            ),
            unreadCount: wasUnread
              ? Math.max(0, old.unreadCount - 1)
              : old.unreadCount,
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _notificationId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(notificationKeys.list(), context.previousData);
      }
    },
  });

  // Wrapper functions for compatibility
  const markAsRead = async (notificationId: string) => {
    const result = await markAsReadMutation.mutateAsync(notificationId);
    return result;
  };

  const markAllAsRead = async () => {
    const result = await markAllAsReadMutation.mutateAsync();
    return result;
  };

  const removeNotification = async (notificationId: string) => {
    const result = await deleteMutation.mutateAsync(notificationId);
    return result;
  };

  const refresh = () => {
    refetch();
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification: removeNotification,
    refresh,
  };
}

// Re-export type for convenience
export type { NotificationData };
