"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { Bell, Plus } from "lucide-react";
import NotificationStats from "@/components/notifications/NotificationStats";
import NotificationTable from "@/components/notifications/NotificationTable";
import NotificationActionModals from "@/components/notifications/NotificationActionModals";
import {
  Notification,
  NotificationStats as StatsType,
  ModalType,
} from "@/app/types/Notification";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<StatsType>({
    total: 0,
    byType: { info: 0, alert: 0, update: 0, promotion: 0, warning: 0 },
    unread: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [modal, setModal] = useState<{
    type: ModalType;
    notification: Notification | null;
  } | null>(null);

  const fetchNotifications = async () => {
    setDataLoading(true);
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSetModal = (newModal: {
    type: ModalType;
    notification: Notification | null;
  }) => {
    setModal(newModal);
  };

  const handleCloseModal = () => {
    setModal(null);
  };

  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleRefresh = () => {
    fetchNotifications();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4AA8FF]"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Cross-Platform Notification System Overview
            </p>
          </div>
          <h2 className="text-3xl font-bold tracking-tight"></h2>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() =>
                handleSetModal({ type: "create", notification: null })
              }
              className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00] w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          </div>
        </div>

        <NotificationStats stats={stats} />

        <NotificationTable
          notifications={notifications}
          dataLoading={dataLoading}
          onSetModal={handleSetModal}
        />

        {modal && (
          <NotificationActionModals
            modal={modal}
            onClose={handleCloseModal}
            onRefresh={handleRefresh}
          />
        )}

        <Toaster />
      </div>
    </DashboardLayout>
  );
}
