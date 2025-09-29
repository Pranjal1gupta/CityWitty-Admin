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
import { Textarea } from "@/components/ui/textarea";
import { Merchant, ModalType } from "@/app/types/Merchant";

interface MerchantActionModalsProps {
  modal: { type: ModalType; merchant: Merchant | null };
  onClose: () => void;
  onUpdateMerchantStatus: (merchantId: string, status: string, reason?: string) => void;
  onUpdateMerchantVisibility: (merchantId: string, visibility: boolean) => void;
}

export default function MerchantActionModals({
  modal,
  onClose,
  onUpdateMerchantStatus,
  onUpdateMerchantVisibility,
}: MerchantActionModalsProps) {
  const [suspensionReason, setSuspensionReason] = useState("");

  useEffect(() => {
    if (modal.type !== "deactivate") {
      setSuspensionReason("");
    }
  }, [modal.type]);

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
          confirmClass: "bg-blue-600 hover:bg-blue-700",
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
        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={content.confirmClass}
            onClick={handleConfirm}
            disabled={modal.type === "deactivate" && !suspensionReason.trim()}
          >
            {content.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
