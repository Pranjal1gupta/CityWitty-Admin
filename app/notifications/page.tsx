"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Notification, NotificationStats, ModalType } from "@/app/types/Notification";
import NotificationStatsComponent from "@/components/notifications/NotificationStats";
import NotificationTable from "@/components/notifications/NotificationTable";
import NotificationViewModal from "@/components/notifications/NotificationViewModal";
import NotificationActionModals from "@/components/notifications/NotificationActionModals";

export default function NotificationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const pathname = usePathname();

  // Unified modal state
  const [modal, setModal] = useState<{
    type: ModalType;
    notification: Notification | null;
  }>({
    type: null,
    notification: null,
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(data.notifications);
      } catch (err) {
        console.error(err);
        toast.error("Error loading notifications data");
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [user, pathname]);

  const stats = useMemo((): NotificationStats => ({
    total: notifications.length,
    byType: notifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    unread: notifications.filter((n) => n.is_read.some(status => !status.read)).length,
  }), [notifications]);

  // Unified notification update helper
  const updateNotification = async (
    notificationId: string,
    updates: Partial<Notification>
  ) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update notification");
      const updatedNotification = await res.json();
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n._id === notificationId ? { ...n, ...updatedNotification } : n
        );
        return updated;
      });
      toast.success("Notification updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Error updating notification");
    }
  };

  // Delete notification helper
  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete notification");
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("Notification deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Error deleting notification");
    }
  };

  // Create notification helper
  const createNotification = async (notificationData: Omit<Notification, "_id" | "createdAt">) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Show detailed error message from backend
        const errorMsg = data.error || "Failed to create notification";
        const details = data.details ? JSON.stringify(data.details) : "";
        throw new Error(details ? `${errorMsg}: ${details}` : errorMsg);
      }
      
      setNotifications((prev) => [data, ...prev]);
      toast.success("Notification created successfully");
    } catch (err: any) {
      console.error("Create notification error:", err);
      toast.error(err.message || "Error creating notification");
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4AA8FF]"></div>
      </div>
    );
  if (!user) return null;

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
              <p className="text-muted-foreground">
                Manage and send notifications to users, merchants, and franchisees
              </p>
            </div>
            <Button
              className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00] w-full sm:w-auto"
              onClick={() => setModal({ type: "create", notification: null })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Send New Notification
            </Button>
          </div>

          <NotificationStatsComponent stats={stats} />
          <NotificationTable
            notifications={notifications}
            dataLoading={dataLoading}
            onSetModal={setModal}
            onUpdateNotification={updateNotification}
            onDeleteNotification={deleteNotification}
          />
          <NotificationViewModal
            notification={modal.notification}
            isOpen={modal.type === "view"}
            onClose={() => setModal({ type: null, notification: null })}
          />
          <NotificationActionModals
            modal={modal}
            onClose={() => setModal({ type: null, notification: null })}
            onCreateNotification={createNotification}
            onUpdateNotification={updateNotification}
            onDeleteNotification={deleteNotification}
          />
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}
