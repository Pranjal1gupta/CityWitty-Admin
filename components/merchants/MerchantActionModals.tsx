import { useState, useEffect } from "react";
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

interface MerchantActionModalsProps {
  modal: { type: ModalType; merchant: Merchant | null };
  onClose: () => void;
  onUpdateMerchantStatus: (merchantId: string, status: string, reason?: string) => void;
  onUpdateMerchantVisibility: (merchantId: string, visibility: boolean) => void;
  onUpdateMerchantLimits: (merchantId: string, limits: { ListingLimit?: number; totalGraphics?: number; totalReels?: number; isWebsite?: boolean; totalPodcast?: number }, secretCode: string) => void;
  onUpdateMerchantStatuses: (merchantId: string, statuses: { citywittyAssured?: boolean; isVerified?: boolean; isCWassured?: boolean; isPremiumSeller?: boolean; isTopMerchant?: boolean }) => void;
}

export default function MerchantActionModals({
  modal,
  onClose,
  onUpdateMerchantStatus,
  onUpdateMerchantVisibility,
  onUpdateMerchantLimits,
  onUpdateMerchantStatuses,
}: MerchantActionModalsProps) {
  const [suspensionReason, setSuspensionReason] = useState("");
  const [limits, setLimits] = useState({
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
  const [originalStatuses, setOriginalStatuses] = useState<MerchantStatuses>({
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
      setLimits({
        ListingLimit: modal.merchant.ListingLimit || 0,
        totalGraphics: modal.merchant.totalGraphics || 0,
        totalReels: modal.merchant.totalReels || 0,
        isWebsite: modal.merchant.isWebsite || false,
        totalPodcast: modal.merchant.totalPodcast || 0,
      });
      setSecretCode("");
    }
    if (modal.type === "toggleStatuses" && modal.merchant) {
      const initialStatuses = {
        citywittyAssured: modal.merchant.citywittyAssured || false,
        isVerified: modal.merchant.isVerified || false,
        isCWassured: modal.merchant.isCWassured || false,
        isPremiumSeller: modal.merchant.isPremiumSeller || false,
        isTopMerchant: modal.merchant.isTopMerchant || false,
      };
      setStatuses(initialStatuses);
      setOriginalStatuses(initialStatuses);
    }
  }, [modal.type, modal.merchant]);

  if (!modal.merchant) return null;

  const merchant = modal.merchant!;

  const handleConfirm = () => {
    if (modal.type === "approve") {
      onUpdateMerchantStatus(merchant._id, "active");
    } else if (modal.type === "deactivate") {
      onUpdateMerchantStatus(merchant._id, "suspended", suspensionReason);
    } else if (modal.type === "activate") {
      onUpdateMerchantStatus(merchant._id, "active");
    } else if (modal.type === "toggleVisibility") {
      onUpdateMerchantVisibility(merchant._id, !merchant.visibility);
    }
    onClose();
  };

  const handleConfirmAction = () => {
    if (modal.type === "adjustLimits") {
      if (secretCode !== "SuperSecret123") {
        toast.error("Invalid secret code");
        return;
      }
      onUpdateMerchantLimits(merchant._id, limits, secretCode);
    } else if (modal.type === "toggleStatuses") {
      onUpdateMerchantStatuses(merchant._id, statuses);
    }
    onClose();
    setShowConfirmation(false);
  };

  const getModalContent = () => {
    switch (modal.type) {
      case "deactivate":
        return {
          title: "Deactivate Merchant",
          description: `Deactivate ${merchant.displayName}. This will suspend their account.`,
          confirmText: "Suspend Merchant",
          confirmClass: "bg-red-600 hover:bg-red-700",
        };
      case "approve":
        return {
          title: "Approve Merchant",
          description: `Approve ${merchant.displayName} to activate their account?`,
          confirmText: "Yes, Approve",
          confirmClass: "bg-green-600 hover:bg-green-700",
        };
      case "activate":
        return {
          title: "Activate Merchant",
          description: `Activate ${merchant.displayName} to allow transactions?`,
          confirmText: "Yes, Activate",
          confirmClass: "bg-green-600 hover:bg-green-700",
        };
      case "adjustLimits":
        return {
          title: "Adjust Limits",
          description: `Adjust limits for ${merchant.displayName}.`,
          confirmText: "Update Limits",
          confirmClass: "bg-green-600 hover:bg-green-700",
        };
      case "toggleVisibility":
        return {
          title: "Toggle Visibility",
          description: `Toggle visibility for ${merchant.displayName}.`,
          confirmText: "Toggle Visibility",
          confirmClass: "bg-green-600 hover:bg-green-700",
        };
      case "toggleStatuses":
        return {
          title: "Toggle Statuses",
          description: `Toggle statuses for ${merchant.displayName}.`,
          confirmText: "Update Statuses",
          confirmClass: "bg-green-600 hover:bg-green-700",
        };
      default:
        return null;
    }
  };

  const statusKeys = ['citywittyAssured', 'isVerified', 'isCWassured', 'isPremiumSeller', 'isTopMerchant'] as const;
  type StatusKey = typeof statusKeys[number];

  const statusItems: { key: StatusKey; label: string }[] = [
    { key: 'citywittyAssured', label: 'Citywitty Assured' },
    { key: 'isVerified', label: 'Verified' },
    { key: 'isCWassured', label: 'CW Assured' },
    { key: 'isPremiumSeller', label: 'Premium Seller' },
    { key: 'isTopMerchant', label: 'Top Merchant' },
  ];

  const content = getModalContent();
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
                type="number"
                value={limits.ListingLimit || ""}
                onChange={(e) => setLimits(prev => ({ ...prev, ListingLimit: parseInt(e.target.value) || 0 }))}
                placeholder="Enter listing limit"
                className="mt-2"
              />
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <label className="text-sm font-medium">Total Graphics</label>
              <Input
                type="number"
                value={limits.totalGraphics || ""}
                onChange={(e) => setLimits(prev => ({ ...prev, totalGraphics: parseInt(e.target.value) || 0 }))}
                placeholder="Enter total graphics"
                className="mt-2"
              />
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <label className="text-sm font-medium">Total Reels</label>
              <Input
                type="number"
                value={limits.totalReels || ""}
                onChange={(e) => setLimits(prev => ({ ...prev, totalReels: parseInt(e.target.value) || 0 }))}
                placeholder="Enter total reels"
                className="mt-2"
              />
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <label className="text-sm font-medium">Total Podcast</label>
              <Input
                type="number"
                value={limits.totalPodcast || ""}
                onChange={(e) => setLimits(prev => ({ ...prev, totalPodcast: parseInt(e.target.value) || 0 }))}
                placeholder="Enter total podcast"
                className="mt-2"
              />
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <label className="text-sm font-medium">Is Website</label>
              <Switch
                checked={limits.isWebsite}
                onCheckedChange={(checked) => setLimits(prev => ({ ...prev, isWebsite: checked }))}
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
            {statusItems.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{label}</h4>
                  <Badge variant={statuses[key] ? "default" : "destructive"} className={statuses[key] ? "bg-green-500 text-white" : ""}>
                    {statuses[key] ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <Switch
                  checked={statuses[key]}
                  onCheckedChange={(checked) => setStatuses(prev => ({ ...prev, [key]: checked }))}
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
            onClick={(modal.type === "adjustLimits" || modal.type === "toggleStatuses") ? () => setShowConfirmation(true) : handleConfirm}
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
          <DialogDescription>Are you sure you want to {modal.type === "adjustLimits" ? "update the limits" : "update the statuses"} for {merchant.displayName}?</DialogDescription>
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
