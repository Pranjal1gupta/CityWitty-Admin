"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const AVAILABLE_TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "cards", label: "Users & Cards" },
  { id: "merchants", label: "Merchants" },
  { id: "franchises", label: "Franchises" },
  { id: "ecommerce", label: "Ecommerce" },
  { id: "transactions", label: "Transactions" },
  { id: "careers", label: "Careers" },
  { id: "teams", label: "Team" },
  { id: "manage-admins", label: "Manage Admins" },
  { id: "notifications", label: "Notifications" },
  { id: "profile", label: "Profile" },
];

interface AdminTabCustomizationCardProps {
  isSuperAdmin: boolean;
  userId: string;
  currentPermissions: string[];
}

export default function AdminTabCustomizationCard({
  isSuperAdmin,
  userId,
  currentPermissions,
}: AdminTabCustomizationCardProps) {
  const [enabledTabs, setEnabledTabs] = useState<string[]>(currentPermissions.length > 0 ? currentPermissions : AVAILABLE_TABS.map(t => t.id));
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEnabledTabs(currentPermissions.length > 0 ? currentPermissions : AVAILABLE_TABS.map(t => t.id));
  }, [currentPermissions]);

  const handleTabToggle = (tabId: string) => {
    setEnabledTabs(prev => {
      const updated = prev.includes(tabId)
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId];
      setHasChanges(true);
      return updated;
    });
  };

  const handleSavePermissions = async () => {
    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          permissions: enabledTabs,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Tab permissions updated successfully");
        setHasChanges(false);
      } else {
        toast.error(data.error || "Failed to update permissions");
      }
    } catch (error) {
      toast.error("Failed to update permissions");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            <div>
              <CardTitle>Admin Panel Customization</CardTitle>
              <CardDescription>
                Configure which tabs are visible in the admin panel
              </CardDescription>
            </div>
          </div>
          {isSuperAdmin && (
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              Super Admin
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-md gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Toggle tabs on/off to control visibility in the admin dashboard. Changes are applied to all regular admins.
          </p>
        </div>

        <div className="space-y-3">
          {AVAILABLE_TABS.map((tab) => (
            <div key={tab.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <Label htmlFor={`tab-${tab.id}`} className="cursor-pointer font-medium text-gray-700">
                {tab.label}
              </Label>
              <Switch
                id={`tab-${tab.id}`}
                checked={enabledTabs.includes(tab.id)}
                onCheckedChange={() => handleTabToggle(tab.id)}
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {enabledTabs.length} of {AVAILABLE_TABS.length} tabs enabled
            </p>
            <Button
              onClick={handleSavePermissions}
              disabled={!hasChanges || isSaving}
              className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00]"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : hasChanges ? (
                "Save Changes"
              ) : (
                "No Changes"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
