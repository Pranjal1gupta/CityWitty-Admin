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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Merchant, ModalType } from "@/app/types/Merchant";

type MerchantStatuses = {
  citywittyAssured: boolean;
  isVerified: boolean;
  isCWassured: boolean;
  isPremiumSeller: boolean;
  isTopMerchant: boolean;
};

type MerchantLimits = {
  ListingLimit: number;
  totalGraphics: number;
  totalReels: number;
  isWebsite: boolean;
  totalPodcast: number;
};

interface MerchantActionModalsProps {
  modal: { type: ModalType; merchant: Merchant | null; newVisibility?: boolean; newStatus?: string; suspensionReason?: string };
  onClose: () => void;
  onUpdateMerchantStatus: (merchantId: string, status: string, reason?: string) => Promise<void>;
  onUpdateMerchantVisibility: (merchantId: string, visibility: boolean) => Promise<void>;
  onUpdateMerchantLimits: (merchantId: string, limits: MerchantLimits, secretCode: string) => Promise<void>;
  onUpdateMerchantStatuses: (merchantId: string, statuses: Partial<MerchantStatuses>) => Promise<void>;
}

// Constants
const MODAL_CONFIGS = {
  deactivate: {
    title: "Deactivate Merchant",
    description: (name: string, visibility?: boolean, status?: string) => `Deactivate ${name}. This will suspend their account.`,
    confirmText: "Suspend Merchant",
    confirmClass: "bg-red-600 hover:bg-red-700",
  },
  approve: {
    title: "Approve Merchant",
    description: (name: string, visibility?: boolean, status?: string) => `Approve ${name} to activate their account?`,
    confirmText: "Yes, Approve",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  activate: {
    title: "Activate Merchant",
    description: (name: string, visibility?: boolean, status?: string) => `Activate ${name} to allow transactions?`,
    confirmText: "Yes, Activate",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  adjustLimits: {
    title: "Adjust Limits",
    description: (name: string, visibility?: boolean, status?: string) => `Adjust limits for ${name}.`,
    confirmText: "Update Limits",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  toggleVisibility: {
    title: "Toggle Visibility",
    description: (name: string, visibility?: boolean, status?: string) => `Toggle visibility for ${name}.`,
    confirmText: "Toggle Visibility",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  toggleStatuses: {
    title: "Toggle Statuses",
    description: (name: string, visibility?: boolean, status?: string) => `Toggle statuses for ${name}.`,
    confirmText: "Update Statuses",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  confirmVisibilityChange: {
    title: "Confirm Visibility Change",
    description: (name: string, visibility?: boolean, status?: string) => `Are you sure you want to change visibility to ${visibility ? "Visible" : "Hidden"} for ${name}?`,
    confirmText: "Confirm",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  confirmStatusChange: {
    title: "Confirm Status Change",
    description: (name: string, visibility?: boolean, status?: string) => `Are you sure you want to change status to ${status} for ${name}?`,
    confirmText: "Confirm",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
};

const STATUS_ITEMS = [
  { key: 'citywittyAssured' as const, label: 'Citywitty Assured' },
  { key: 'isVerified' as const, label: 'Verified' },
  { key: 'isCWassured' as const, label: 'CW Assured' },
  { key: 'isPremiumSeller' as const, label: 'Premium Seller' },
  { key: 'isTopMerchant' as const, label: 'Top Merchant' },
];

// Helper functions
const initializeLimits = (merchant: Merchant): MerchantLimits => ({
  ListingLimit: merchant.ListingLimit || 0,
  totalGraphics: merchant.totalGraphics || 0,
  totalReels: merchant.totalReels || 0,
  isWebsite: merchant.isWebsite || false,
  totalPodcast: merchant.totalPodcast || 0,
});

const initializeStatuses = (merchant: Merchant): MerchantStatuses => ({
  citywittyAssured: merchant.citywittyAssured || false,
  isVerified: merchant.isVerified || false,
  isCWassured: merchant.isCWassured || false,
  isPremiumSeller: merchant.isPremiumSeller || false,
  isTopMerchant: merchant.isTopMerchant || false,
});

const getModalConfig = (type: ModalType, merchantName: string, newVisibility?: boolean, newStatus?: string) => {
  if (!type || type === "view") return null;
  const config = MODAL_CONFIGS[type as keyof typeof MODAL_CONFIGS];
  if (!config) return null;

  return {
    ...config,
    description: typeof config.description === 'function'
      ? config.description(merchantName, newVisibility, newStatus)
      : config.description,
  };
};

const handleSimpleConfirm = async (modal: MerchantActionModalsProps['modal'], merchant: Merchant, onUpdateMerchantStatus: (merchantId: string, status: string, reason?: string) => Promise<void>, onUpdateMerchantVisibility: (merchantId: string, visibility: boolean) => Promise<void>, onClose: () => void) => {
  switch (modal.type) {
    case "approve":
    case "activate":
      await onUpdateMerchantStatus(merchant._id, "active");
      break;
    case "deactivate":
      await onUpdateMerchantStatus(merchant._id, "suspended", modal.suspensionReason);
      break;
    case "toggleVisibility":
      await onUpdateMerchantVisibility(merchant._id, !merchant.visibility);
      break;
  }
  onClose();
};

const handleComplexConfirm = async (modal: MerchantActionModalsProps['modal'], merchant: Merchant, limits: MerchantLimits, secretCode: string, statuses: MerchantStatuses, onUpdateMerchantLimits: (merchantId: string, limits: MerchantLimits, secretCode: string) => Promise<void>, onUpdateMerchantStatuses: (merchantId: string, statuses: Partial<MerchantStatuses>) => Promise<void>, onUpdateMerchantVisibility: (merchantId: string, visibility: boolean) => Promise<void>, onUpdateMerchantStatus: (merchantId: string, status: string, reason?: string) => Promise<void>, onClose: () => void) => {
  switch (modal.type) {
    case "adjustLimits":
      if (secretCode !== "SuperSecret123") {
        toast.error("Invalid secret code");
        return;
      }
      await onUpdateMerchantLimits(merchant._id, limits, secretCode);
      break;
    case "toggleStatuses":
      await onUpdateMerchantStatuses(merchant._id, statuses);
      break;
    case "confirmVisibilityChange":
      await onUpdateMerchantVisibility(merchant._id, modal.newVisibility!);
      break;
    case "confirmStatusChange":
      await onUpdateMerchantStatus(merchant._id, modal.newStatus!);
      break;
  }
  onClose();
};



export default function MerchantActionModals({
  modal,
  onClose,
  onUpdateMerchantStatus,
  onUpdateMerchantVisibility,
  onUpdateMerchantLimits,
  onUpdateMerchantStatuses,
}: MerchantActionModalsProps) {
  const [suspensionReason, setSuspensionReason] = useState("");
  const [limits, setLimits] = useState<MerchantLimits>({
    ListingLimit: 0,
    totalGraphics: 0,
    totalReels: 0,
    isWebsite: false,
    totalPodcast: 0,
  });
  const [secretCode, setSecretCode] = useState("");
  const [statuses, setStatuses] = useState<MerchantStatuses>({
    citywittyAssured: false,
    isVerified: false,
    isCWassured: false,
    isPremiumSeller: false,
    isTopMerchant: false,
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    setShowConfirmation(false);
    if (modal.type !== "deactivate") {
      setSuspensionReason("");
    }
    if (modal.type === "adjustLimits" && modal.merchant) {
      setLimits(initializeLimits(modal.merchant));
      setSecretCode("");
    }
    if (modal.type === "toggleStatuses" && modal.merchant) {
      const initialStatuses = initializeStatuses(modal.merchant);
      setStatuses(initialStatuses);
    }
  }, [modal.type, modal.merchant]);

  if (!modal.merchant) return null;

  const merchant = modal.merchant!;

  const handleConfirm = () => handleSimpleConfirm(modal, merchant, onUpdateMerchantStatus, onUpdateMerchantVisibility, onClose);

  const handleConfirmAction = () => handleComplexConfirm(modal, merchant, limits, secretCode, statuses, onUpdateMerchantLimits, onUpdateMerchantStatuses, onUpdateMerchantVisibility, onUpdateMerchantStatus, () => setShowConfirmation(false));

  const handleMainConfirm = () => handleComplexConfirm(modal, merchant, limits, secretCode, statuses, onUpdateMerchantLimits, onUpdateMerchantStatuses, onUpdateMerchantVisibility, onUpdateMerchantStatus, onClose);

  const content = getModalConfig(modal.type, merchant.displayName, modal.newVisibility, modal.newStatus);
  if (!content) return null;

  return (
    <>
    <Dialog open={!!modal.type} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>
        {modal.type === "deactivate" && (
          <div className="space-y-2">
            <label htmlFor="suspensionReason" className="text-sm font-medium">
              Suspension Reason (Required)
            </label>
            <Textarea
              id="suspensionReason"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="Enter the reason for suspending this merchant..."
              rows={3}
            />
          </div>
        )}
        {modal.type === "adjustLimits" && (
          <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto">
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <label className="text-sm font-medium">Listing Limit</label>
              <Input
                type="text"
                value={limits.ListingLimit || 0}
                onChange={(e) => setLimits((prev: MerchantLimits) => ({ ...prev, ListingLimit: parseInt(e.target.value) || 0 }))}
                placeholder="Enter listing limit"
                className="mt-2"
              />
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <label className="text-sm font-medium">Total Graphics</label>
              <Input
                type="text"
                value={limits.totalGraphics }
                onChange={(e) => setLimits((prev: MerchantLimits) => ({ ...prev, totalGraphics: parseInt(e.target.value) || 0 }))}
                placeholder="Enter total graphics"
                className="mt-2"
              />
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <label className="text-sm font-medium">Total Reels</label>
              <Input
                type="text"
                value={limits.totalReels || 0 }
                onChange={(e) => setLimits((prev: MerchantLimits) => ({ ...prev, totalReels: parseInt(e.target.value) || 0 }))}
                placeholder="Enter total reels"
                className="mt-2"
              />
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <label className="text-sm font-medium">Total Podcast</label>
              <Input
                type="text"
                value={limits.totalPodcast || 0}
                onChange={(e) => setLimits((prev: MerchantLimits) => ({ ...prev, totalPodcast: parseInt(e.target.value) || 0 }))}
                placeholder="Enter total podcast"
                className="mt-2"
              />
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <label className="text-sm font-medium">Is Website</label>
              <Switch
                checked={limits.isWebsite}
                onCheckedChange={(checked) => setLimits((prev: MerchantLimits) => ({ ...prev, isWebsite: checked }))}
              />
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <label className="text-sm font-medium">Secret Code</label>
              <Input
                type="password"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                placeholder="Enter secret code"
                className="mt-2"
              />
            </div>
          </div>
        )}
        {modal.type === "toggleStatuses" && (
          <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto">
            {STATUS_ITEMS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{label}</h4>
                  <Badge variant={statuses[key] ? "default" : "destructive"} className={statuses[key] ? "bg-green-500 text-white" : ""}>
                    {statuses[key] ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <Switch
                  checked={statuses[key]}
                  onCheckedChange={(checked) => setStatuses((prev: MerchantStatuses) => ({ ...prev, [key]: checked }))}
                />
              </div>
            ))}
          </div>
        )}
        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={content.confirmClass}
            onClick={(modal.type === "adjustLimits" || modal.type === "toggleStatuses") ? () => setShowConfirmation(true) : (modal.type === "confirmVisibilityChange" || modal.type === "confirmStatusChange") ? handleMainConfirm : handleConfirm}
            disabled={
              (modal.type === "deactivate" && !suspensionReason.trim()) ||
              (modal.type === "adjustLimits" && secretCode !== "SuperSecret123")
            }
          >
            {content.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Update</DialogTitle>
          <DialogDescription>Are you sure you want to {modal.type === "adjustLimits" ? "update the limits" : modal.type === "toggleStatuses" ? "update the statuses" : "change the visibility"} for {merchant.displayName}?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={() => setShowConfirmation(false)}>
            Cancel
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 mt-1" onClick={handleConfirmAction}>
            Yes, Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
