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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Lock, AlertCircle, Settings } from "lucide-react";
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
  { id: "feedback", label: "Feedback" },
  { id: "notifications", label: "Notifications" },
  { id: "profile", label: "Profile" },
];

interface PermissionsCardProps {
  permissions: string[];
  role: "admin" | "superadmin";
  isSuperAdmin?: boolean;
  userId?: string;
  currentPermissions?: string[];
  onPermissionsUpdated?: () => void;
}

export default function PermissionsCard({
  permissions,
  role,
  isSuperAdmin = false,
  userId = "",
  currentPermissions = [],
  onPermissionsUpdated,
}: PermissionsCardProps) {
  const [enabledTabs, setEnabledTabs] = useState<string[]>(AVAILABLE_TABS.map(t => t.id));
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoadingTabs, setIsLoadingTabs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const initializeTabs = async () => {
      if (isSuperAdmin && userId) {
        setIsLoadingTabs(true);
        try {
          const res = await fetch(`/api/admin/permissions?userId=${userId}`);
          const data = await res.json();
          if (res.ok && data.success && data.permissions) {
            setEnabledTabs(data.permissions);
            setHasChanges(false);
          } else {
            setEnabledTabs(AVAILABLE_TABS.map(t => t.id));
            setHasChanges(false);
          }
        } catch (error) {
          setEnabledTabs(AVAILABLE_TABS.map(t => t.id));
          setHasChanges(false);
        } finally {
          setIsLoadingTabs(false);
        }
      } else {
        setEnabledTabs(AVAILABLE_TABS.map(t => t.id));
        setHasChanges(false);
      }
    };

    initializeTabs();
  }, [isSuperAdmin, userId]);

  const getRoleAccessDescription = () => {
    if (role === 'superadmin') return 'Full system access';
    if (role === 'admin') return 'Administrative access';
    return 'Limited access';
  };

  const getRoleBadgeColor = () => {
    if (role === 'superadmin') return 'bg-purple-100 text-purple-800';
    if (role === 'admin') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

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
        onPermissionsUpdated?.();
      } else {
        toast.error(data.error || "Failed to update permissions");
      }
    } catch (error) {
      toast.error("Failed to update permissions");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="mr-2 h-5 w-5" />
          Permissions
        </CardTitle>
        <CardDescription>Your account permissions and access rights</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {role === "superadmin" && (
            <div className="flex items-start p-3 bg-purple-50 border border-purple-200 rounded-md gap-2">
              <AlertCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-700">
                As a Super Admin, you can customize which tabs are visible to other admins in the &quot;Admin Panel Customization&quot; section below.
              </p>
            </div>
          )}
          {permissions.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Current Permissions:</p>
              <div className="flex flex-wrap gap-2">
                {permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No specific permissions assigned</p>
              <p className="text-xs text-gray-500">Contact administrator for permission updates</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Role-based Access</p>
                <p className="text-sm text-gray-600">
                  {getRoleAccessDescription()}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
                {role}
              </span>
            </div>
          </div>

          {isSuperAdmin && (
            <>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Admin Panel Customization</p>
                    <p className="text-xs text-gray-600">Configure which tabs are visible in the admin panel</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-md gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Toggle tabs on/off to control visibility in the admin dashboard. Changes are applied to all regular admins.
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{enabledTabs.length}</span> of <span className="font-medium">{AVAILABLE_TABS.length}</span> tabs enabled
                </div>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] text-white whitespace-nowrap"
                >
                  Manage Tabs
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>

      {isSuperAdmin && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Tab Visibility</DialogTitle>
              <DialogDescription>
                Toggle tabs to control which tabs are visible to regular admins
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 max-h-96 overflow-y-auto py-4">
              {AVAILABLE_TABS.map((tab) => (
                <div key={tab.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Label htmlFor={`modal-tab-${tab.id}`} className="cursor-pointer font-medium text-gray-700">
                    {tab.label}
                  </Label>
                  <Switch
                    id={`modal-tab-${tab.id}`}
                    checked={enabledTabs.includes(tab.id)}
                    onCheckedChange={() => handleTabToggle(tab.id)}
                  />
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleSavePermissions();
                  setIsModalOpen(false);
                }}
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
