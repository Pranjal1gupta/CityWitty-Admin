import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Bell, MessageSquare, Users, Tag, Palette, Clock, FileText, Settings } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Notification, ModalType } from "@/app/types/Notification";
import { MultiSelect } from "@/components/ui/multi-select";
import { usePathname } from "next/navigation";

interface NotificationActionModalsProps {
  modal: { type: ModalType; notification: Notification | null };
  onClose: () => void;
  onCreateNotification: (notificationData: Omit<Notification, "_id" | "createdAt">) => void;
  onUpdateNotification: (notificationId: string, updates: Partial<Notification>) => void;
  onDeleteNotification: (notificationId: string) => void;
}

const getTypeColors = (type: string) => {
  switch (type) {
    case "info":
      return {
        primary: "text-blue-600",
        primaryBg: "bg-blue-50",
        primaryBorder: "border-blue-200",
        primaryFocus: "focus:border-blue-500 focus:ring-blue-500",
        gradient: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
        iconBg: "bg-blue-100",
      };
    case "alert":
      return {
        primary: "text-red-600",
        primaryBg: "bg-red-50",
        primaryBorder: "border-red-200",
        primaryFocus: "focus:border-red-500 focus:ring-red-500",
        gradient: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
        iconBg: "bg-red-100",
      };
    case "update":
      return {
        primary: "text-green-600",
        primaryBg: "bg-green-50",
        primaryBorder: "border-green-200",
        primaryFocus: "focus:border-green-500 focus:ring-green-500",
        gradient: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
        iconBg: "bg-green-100",
      };
    case "promotion":
      return {
        primary: "text-purple-600",
        primaryBg: "bg-purple-50",
        primaryBorder: "border-purple-200",
        primaryFocus: "focus:border-purple-500 focus:ring-purple-500",
        gradient: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
        iconBg: "bg-purple-100",
      };
    case "warning":
      return {
        primary: "text-orange-600",
        primaryBg: "bg-orange-50",
        primaryBorder: "border-orange-200",
        primaryFocus: "focus:border-orange-500 focus:ring-orange-500",
        gradient: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
        iconBg: "bg-orange-100",
      };
    default:
      return {
        primary: "text-gray-600",
        primaryBg: "bg-gray-50",
        primaryBorder: "border-gray-200",
        primaryFocus: "focus:border-gray-500 focus:ring-gray-500",
        gradient: "from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
        iconBg: "bg-gray-100",
      };
  }
};

const MODAL_CONFIGS = {
  create: {
    title: "Create New Notification",
    description: "Craft and send personalized notifications to engage your users, merchants, or franchisees effectively",
    confirmText: "Create Notification",
    confirmClass: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    icon: Bell,
  },
  edit: {
    title: "Edit Notification",
    description: "Update and refine your notification details for better impact",
    confirmText: "Update Notification",
    confirmClass: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    icon: Settings,
  },
  delete: {
    title: "Delete Notification",
    description: (title: string) => `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    confirmText: "Delete Notification",
    confirmClass: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
    icon: X,
  },
};

const NOTIFICATION_TYPES = [
  { value: "info", label: "Info" },
  { value: "alert", label: "Alert" },
  { value: "update", label: "Update" },
  { value: "promotion", label: "Promotion" },
  { value: "warning", label: "Warning" },
];

const TARGET_AUDIENCES = [
  { value: "user", label: "Users" },
  { value: "merchant", label: "Merchants" },
  { value: "franchise", label: "Franchisees" },
  { value: "all", label: "All" },
];

const ICON_OPTIONS = [
  { value: "info", label: "Info" },
  { value: "alert", label: "Alert" },
  { value: "update", label: "Update" },
  { value: "promotion", label: "Promotion" },
  { value: "warning", label: "Warning" },
];

// Initialize notification data for form
// Note: is_read is managed by the backend when users read notifications, not editable here
const initializeNotificationData = (notification: Notification | null) => ({
  title: notification?.title || "",
  message: notification?.message || "",
  type: notification?.type || "info",
  status: notification?.status || "draft",
  target_audience: notification?.target_audience || "all",
  target_ids: notification?.target_ids || [],
  icon: notification?.icon || "",
  expires_at: notification?.expires_at || undefined,
  additional_field: notification?.additional_field || undefined,
});

type FormDataType = ReturnType<typeof initializeNotificationData>;

export default function NotificationActionModals({
  modal,
  onClose,
  onCreateNotification,
  onUpdateNotification,
  onDeleteNotification,
}: NotificationActionModalsProps) {
  const [formData, setFormData] = useState<FormDataType>(initializeNotificationData(null));
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
  const [merchantOptions, setMerchantOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<{ key: string; value: string }[]>([]);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    if (modal.type === "create") {
      setFormData(initializeNotificationData(null));
      setExpiresAt(undefined);
      setAdditionalFields([]);
      setShowAdditionalFields(false);
    } else if (modal.notification) {
      setFormData(initializeNotificationData(modal.notification));
      setExpiresAt(modal.notification.expires_at ? new Date(modal.notification.expires_at) : undefined);
      
      // Parse existing additional_field into key-value pairs
      if (modal.notification.additional_field) {
        const existingFields = typeof modal.notification.additional_field === 'string' 
          ? JSON.parse(modal.notification.additional_field) 
          : modal.notification.additional_field;
        
        const pairs = Object.entries(existingFields).map(([key, value]) => ({
          key,
          value: String(value)
        }));
        
        setAdditionalFields(pairs);
        setShowAdditionalFields(pairs.length > 0);
      } else {
        setAdditionalFields([]);
        setShowAdditionalFields(false);
      }
    }
    setShowConfirmation(false);
  }, [modal.type, modal.notification]);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [userRes, merchantRes] = await Promise.all([
          fetch('/api/users/options'),
          fetch('/api/merchants/options'),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserOptions(userData.userOptions || []);
        }

        if (merchantRes.ok) {
          const merchantData = await merchantRes.json();
          setMerchantOptions(merchantData.merchantOptions || []);
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [pathname]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: FormDataType) => ({ ...prev, [field]: value }));
  };

  const handleTargetAudienceChange = (value: string) => {
    handleInputChange("target_audience", value);
    // Reset target_ids when audience changes
    handleInputChange("target_ids", []);
  };

  const handleAddAdditionalField = () => {
    setAdditionalFields([...additionalFields, { key: "", value: "" }]);
    setShowAdditionalFields(true);
  };

  const handleRemoveAdditionalField = (index: number) => {
    const newFields = additionalFields.filter((_, i) => i !== index);
    setAdditionalFields(newFields);
    if (newFields.length === 0) {
      setShowAdditionalFields(false);
    }
  };

  const handleAdditionalFieldChange = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...additionalFields];
    newFields[index][field] = value;
    setAdditionalFields(newFields);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    if (!formData.target_audience) {
      toast.error("Target audience is required");
      return;
    }

    // Validate target_ids are provided for specific audiences
    if (formData.target_audience !== "all" && (!formData.target_ids || formData.target_ids.length === 0)) {
      toast.error(`Please select at least one ${formData.target_audience === "user" ? "user" : formData.target_audience === "merchant" ? "merchant" : "recipient"}`);
      return;
    }

    // Convert additional fields array to object (Map structure)
    let parsedAdditionalField: Record<string, any> = {};
    if (additionalFields.length > 0) {
      // Filter out empty keys and convert to object
      const validFields = additionalFields.filter(field => field.key.trim() !== '');
      if (validFields.length > 0) {
        parsedAdditionalField = validFields.reduce((acc, field) => {
          // Try to parse value as JSON for complex types, otherwise use as string
          let parsedValue: any = field.value;
          try {
            // Attempt to parse if it looks like JSON
            if (field.value.startsWith('{') || field.value.startsWith('[')) {
              parsedValue = JSON.parse(field.value);
            }
          } catch {
            // If parsing fails, keep as string
            parsedValue = field.value;
          }
          acc[field.key.trim()] = parsedValue;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Prepare data according to backend model structure
    const notificationData: any = {
      title: formData.title,
      message: formData.message,
      type: formData.type,
      target_audience: formData.target_audience,
      target_ids: formData.target_ids || [],
      icon: formData.icon || "",
      expires_at: expiresAt || undefined,
    };

    // Only add additional_field if it has content (matches MongoDB Map structure)
    if (Object.keys(parsedAdditionalField).length > 0) {
      notificationData.additional_field = parsedAdditionalField;
    }

    // Only include status for edit mode
    if (modal.type === "edit") {
      notificationData.status = formData.status;
    }

    if (modal.type === "create") {
      onCreateNotification(notificationData);
    } else if (modal.type === "edit" && modal.notification) {
      onUpdateNotification(modal.notification._id, notificationData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (modal.notification) {
      onDeleteNotification(modal.notification._id);
      onClose();
    }
  };

  const content = MODAL_CONFIGS[modal.type as keyof typeof MODAL_CONFIGS];
  if (!content || modal.type === "view") return null;

  const isEditOrCreate = modal.type === "create" || modal.type === "edit";

  const getTargetOptions = () => {
    if (formData.target_audience === "user") return userOptions;
    if (formData.target_audience === "merchant") return merchantOptions;
    if (formData.target_audience === "all") return [...userOptions, ...merchantOptions];
    return [];
  };

  const colors = getTypeColors(formData.type);

  return (
    <>
      <Dialog open={!!modal.type && !showConfirmation} onOpenChange={onClose}>
        <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 ${colors.primaryBorder} border-2`}>
          <DialogHeader className="pb-6">
            <div className={`flex items-center gap-3 mb-2 p-4 rounded-lg ${colors.primaryBg} ${colors.primaryBorder} border`}>
              {content.icon && <content.icon className={`h-6 w-6 ${colors.primary} ${colors.iconBg} p-1 rounded-full`} />}
              <DialogTitle className={`text-xl font-bold ${colors.primary}`}>{content.title}</DialogTitle>
            </div>
            <DialogDescription className="text-gray-600 leading-relaxed">
              {typeof content.description === 'function' && modal.notification
                ? content.description(modal.notification.title)
                : typeof content.description === 'string' ? content.description : ''}
            </DialogDescription>
          </DialogHeader>

          {modal.type === "delete" ? (
            <div className="py-4">
              <p className="text-sm text-gray-600">
                This will permanently delete the notification and cannot be undone.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <label className="text-sm font-semibold text-gray-700">Title <span className="text-red-500">*</span></label>
                </div>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter an engaging notification title"
                  className="border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <label className="text-sm font-semibold text-gray-700">Message <span className="text-red-500">*</span></label>
                </div>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Write a clear and compelling message for your audience"
                  rows={4}
                  className="border-gray-300 focus:border-primary focus:ring-primary resize-none"
                />
              </div>

              {/* Type and Target Audience */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <label className="text-sm font-semibold text-gray-700">Notification Type</label>
                  </div>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <label className="text-sm font-semibold text-gray-700">Target Audience <span className="text-red-500">*</span></label>
                  </div>
                  <Select
                    value={formData.target_audience}
                    onValueChange={handleTargetAudienceChange}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_AUDIENCES.map((audience) => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target IDs */}
              {(formData.target_audience === "user" || formData.target_audience === "merchant" || formData.target_audience === "all") && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <label className="text-sm font-semibold text-gray-700">
                      Target {formData.target_audience === "user" ? "Users" : formData.target_audience === "merchant" ? "Merchants" : "Users and Merchants"}<span className="text-red-500"> *</span>
                    </label>
                  </div>
                  <MultiSelect
                    value={formData.target_ids}
                    onChange={(value) => handleInputChange("target_ids", value)}
                    options={getTargetOptions()}
                    placeholder={`Select ${formData.target_audience === "user" ? "users" : formData.target_audience === "merchant" ? "merchants" : "users and merchants"}`}
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                    emptyMessage={loadingOptions ? "Loading..." : "No options found."}
                  />
                </div>
              )}

              {/* Icon */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <label className="text-sm font-semibold text-gray-700">Icon</label>
                </div>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => handleInputChange("icon", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expires At */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <label className="text-sm font-semibold text-gray-700">Expires At</label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal border-gray-300 hover:border-primary hover:bg-primary/5 ${
                        !expiresAt && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiresAt ? format(expiresAt, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiresAt}
                      onSelect={setExpiresAt}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Additional Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <label className="text-sm font-semibold text-gray-700">Additional Information</label>
                  </div>
                  {!showAdditionalFields && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAdditionalField}
                      className="h-8 border-gray-300 hover:border-primary hover:bg-primary/5"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Additional Info
                    </Button>
                  )}
                </div>

                {showAdditionalFields && (
                  <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white">
                    {additionalFields.map((field, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="flex-1">
                          <Input
                            placeholder="Key (e.g., url, action)"
                            value={field.key}
                            onChange={(e) => handleAdditionalFieldChange(index, 'key', e.target.value)}
                            className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Value"
                            value={field.value}
                            onChange={(e) => handleAdditionalFieldChange(index, 'value', e.target.value)}
                            className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAdditionalField(index)}
                          className="h-10 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAdditionalField}
                      className="w-full border-gray-300 hover:border-primary hover:bg-primary/5"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Another Field
                    </Button>
                  </div>
                )}
              </div>

              {/* Status (only for edit) */}
              {modal.type === "edit" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                  </div>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="unsent">Unsent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={`bg-gradient-to-r ${colors.gradient}`}
              onClick={modal.type === "delete" ? () => setShowConfirmation(true) : handleSubmit}
            >
              {content.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
