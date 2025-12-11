"use client";

import { memo, useCallback, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNotifications, type NotificationData } from "@/hooks/use-notification-hook";
import { cn } from "@/lib/utils";

// ============================================================================
// NOTIFICATION ICON MAPPING
// ============================================================================

const NOTIFICATION_ICONS: Record<string, string> = {
  APPOINTMENT_CREATED: "📅",
  APPOINTMENT_CONFIRMED: "✅",
  APPOINTMENT_CANCELLED: "❌",
  APPOINTMENT_REMINDER: "⏰",
  PROVIDER_VERIFIED: "🎉",
  PROVIDER_REJECTED: "⚠️",
  REVIEW_RECEIVED: "⭐",
  REVIEW_RESPONSE: "💬",
  DEFAULT: "🔔",
};

const getNotificationIcon = (type: string) =>
  NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.DEFAULT;

// ============================================================================
// NOTIFICATION ITEM COMPONENT (Memoized)
// ============================================================================

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: string, isRead: boolean) => void;
  onDelete: (id: string) => void;
}

const NotificationItem = memo(function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const handleClick = useCallback(() => {
    onMarkAsRead(notification.id, notification.isRead);
  }, [notification.id, notification.isRead, onMarkAsRead]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(notification.id);
    },
    [notification.id, onDelete]
  );

  return (
    <div
      className={cn(
        "relative group",
        !notification.isRead && "bg-cyan-50/50 dark:bg-cyan-900/20"
      )}
    >
      <DropdownMenuItem
        className="flex flex-col items-start gap-1 p-3 cursor-pointer dark:hover:bg-white/5 dark:focus:bg-white/5"
        onClick={handleClick}
      >
        <div className="flex items-start gap-2 w-full">
          <span className="text-lg mt-0.5 shrink-0">
            {getNotificationIcon(notification.type)}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm leading-tight dark:text-white">
                {notification.title}
              </p>
              {!notification.isRead && (
                <span className="h-2 w-2 rounded-full bg-cyan-600 dark:bg-cyan-400 shrink-0 mt-1" />
              )}
            </div>
            <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1 line-clamp-2">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground dark:text-slate-500 mt-1">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      </DropdownMenuItem>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 dark:hover:bg-white/10"
        onClick={handleDelete}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
});

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

const EmptyNotifications = memo(function EmptyNotifications() {
  return (
    <div className="px-4 py-8 text-center text-sm text-muted-foreground dark:text-slate-400">
      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No notifications yet</p>
    </div>
  );
});

// ============================================================================
// MAIN NOTIFICATION COMPONENT
// ============================================================================

export default function Notification() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) {
        refresh();
      }
    },
    [refresh]
  );

  const handleMarkAsRead = useCallback(
    async (notificationId: string, isRead: boolean) => {
      if (!isRead) {
        await markAsRead(notificationId);
      }
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleDelete = useCallback(
    async (notificationId: string) => {
      await deleteNotification(notificationId);
    },
    [deleteNotification]
  );

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative border-none shadow-none border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[500px] overflow-y-auto dark:bg-[#1E293B] dark:border-white/10"
      >
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0 dark:text-white">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-1 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator className="dark:bg-white/10" />

        {notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="dark:bg-white/10" />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs dark:hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
