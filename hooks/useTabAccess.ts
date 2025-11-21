import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const NAVIGATION_TABS = [
  { name: "Dashboard", href: "/dashboard", tabId: "dashboard" },
  { name: "Users & Cards", href: "/cards", tabId: "cards" },
  { name: "Merchants", href: "/merchants", tabId: "merchants" },
  { name: "Franchises", href: "/franchises", tabId: "franchises" },
  { name: "Ecommerce", href: "/ecommerce", tabId: "ecommerce" },
  { name: "Transactions", href: "/transactions", tabId: "transactions" },
  { name: "Careers", href: "/careers", tabId: "careers" },
  { name: "Team", href: "/Teams", tabId: "teams" },
  { name: "Manage Admins", href: "/manage-admins", tabId: "manage-admins" },
  { name: "Feedback", href: "/feedback", tabId: "feedback" },
  { name: "Notifications", href: "/notifications", tabId: "notifications" },
  { name: "Profile", href: "/profile", tabId: "profile" },
];

export function useTabAccess(pathname: string) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);

      const path = pathname.split("/")[1] || "";
      const currentTab = NAVIGATION_TABS.find(
        (tab) => tab.href === `/${path}`
      );

      if (!currentTab) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      if (user?.role === "superadmin") {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/permissions?userId=${user?.id}`);
        const data = await res.json();

        if (data.success && data.permissions) {
          const isAllowed = data.permissions.includes(currentTab.tabId);
          setHasAccess(isAllowed);
        } else {
          setHasAccess(true);
        }
      } catch (error) {
        console.error("Failed to check tab access:", error);
        setHasAccess(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [pathname, user?.id, user?.role]);

  return { hasAccess, isLoading };
}
