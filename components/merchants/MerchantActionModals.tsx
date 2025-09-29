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
import { toast } from "sonner";
import { Merchant, ModalType } from "@/app/types/Merchant";

interface MerchantActionModalsProps {
  modal: { type: ModalType; merchant: Merchant | null };
  onClose: () => void;
  onUpdateMerchantStatus: (merchantId: string, status: string, reason?: string) => void;
  onUpdateMerchantVisibility: (merchantId: string, visibility: boolean) => void;
  onUpdateMerchantLimits: (merchantId: string, limits: { ListingLimit?: number; totalGraphics?: number; totalReels?: number; isWebsite?: boolean; totalPodcast?: number }, secretCode: string) => void;
}

export default function MerchantActionModals({
  modal,
  onClose,
  onUpdateMerchantStatus,
  onUpdateMerchantVisibility,
  onUpdateMerchantLimits,
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

  useEffect(() => {
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
    } else if (modal.type === "adjustLimits") {
      if (secretCode !== "SuperSecret123") {
        toast.error("Invalid secret code");
        return;
      }
      onUpdateMerchantLimits(merchant._id, limits, secretCode);
    }
    onClose();
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
      case "toggleVisibility":
        return {
          title: "Toggle Visibility",
          description: `Are you sure you want to ${merchant.visibility ? "hide" : "show"} ${merchant.displayName}?`,
          confirmText: "Confirm",
          confirmClass: "bg-green-600 hover:bg-blue-700",
        };
      case "adjustLimits":
        return {
          title: "Adjust Limits",
          description: `Adjust limits for ${merchant.displayName}.`,
          confirmText: "Update Limits",
          confirmClass: "bg-green-600 hover:bg-green-700",
        };
      default:
        return null;
    }
  };

  const content = getModalContent();
  if (!content) return null;

  return (
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
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Listing Limit</label>
              <Input
                type="number"
                value={limits.ListingLimit || ""}
                onChange={(e) => setLimits(prev => ({ ...prev, ListingLimit: parseInt(e.target.value) || 0 }))}
                placeholder="Enter listing limit"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Graphics</label>
              <Input
                type="number"
                value={limits.totalGraphics || ""}
                onChange={(e) => setLimits(prev => ({ ...prev, totalGraphics: parseInt(e.target.value) || 0 }))}
                placeholder="Enter total graphics"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Reels</label>
              <Input
                type="number"
                value={limits.totalReels || ""}
                onChange={(e) => setLimits(prev => ({ ...prev, totalReels: parseInt(e.target.value) || 0 }))}
                placeholder="Enter total reels"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Podcast</label>
              <Input
                type="number"
                value={limits.totalPodcast || ""}
                onChange={(e) => setLimits(prev => ({ ...prev, totalPodcast: parseInt(e.target.value) || 0 }))}
                placeholder="Enter total podcast"
              />
            </div>
            <div className="space-y-2 flex items-center justify-between">
              <label className="text-sm font-medium">Is Website</label>
              <Switch
                checked={limits.isWebsite}
                onCheckedChange={(checked) => setLimits(prev => ({ ...prev, isWebsite: checked }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secret Code</label>
              <Input
                type="password"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                placeholder="Enter secret code"
              />
            </div>
          </div>
        )}
        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={content.confirmClass}
            onClick={handleConfirm}
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
  );
}
