"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
  memo,
} from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Merchant, ModalType } from "@/app/types/Merchant";

type MerchantStatuses = {
  citywittyAssured: boolean;
  isVerified: boolean;
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

type PurchasedPackage = {
  variantName: string;
  purchaseDate: string;
  expiryDate: string;
  transactionId: string;
};

interface MerchantActionModalsProps {
  modal: {
    type: ModalType;
    merchant: Merchant | null;
    newVisibility?: boolean;
    newStatus?: string;
    suspensionReason?: string;
  };
  onClose: () => void;
  onUpdateMerchantStatus: (
    merchantId: string,
    status: string,
    reason?: string
  ) => Promise<void>;
  onUpdateMerchantVisibility: (
    merchantId: string,
    visibility: boolean
  ) => Promise<void>;
  onUpdateMerchantLimits: (
    merchantId: string,
    limits: MerchantLimits,
    secretCode: string
  ) => Promise<void>;
  onUpdateMerchantStatuses: (
    merchantId: string,
    statuses: Partial<MerchantStatuses>
  ) => Promise<void>;
  onUpdatePurchasedPackage: (
    merchantId: string,
    packageData: PurchasedPackage
  ) => Promise<void>;
}

// State reducer type
type ModalState = {
  suspensionReason: string;
  limits: MerchantLimits;
  secretCode: string;
  statuses: MerchantStatuses;
  purchasedPackage: PurchasedPackage;
  showConfirmation: boolean;
};

type ModalAction =
  | { type: "SET_SUSPENSION_REASON"; payload: string }
  | { type: "SET_LIMITS"; payload: Partial<MerchantLimits> }
  | { type: "SET_SECRET_CODE"; payload: string }
  | { type: "SET_STATUSES"; payload: Partial<MerchantStatuses> }
  | { type: "SET_PURCHASED_PACKAGE"; payload: Partial<PurchasedPackage> }
  | { type: "SET_SHOW_CONFIRMATION"; payload: boolean }
  | {
      type: "RESET";
      payload: { limits: MerchantLimits; statuses: MerchantStatuses };
    }
  | { type: "INITIALIZE_LIMITS"; payload: MerchantLimits }
  | { type: "INITIALIZE_STATUSES"; payload: MerchantStatuses }
  | { type: "INITIALIZE_PURCHASED_PACKAGE"; payload: PurchasedPackage };

// Constants
const MODAL_CONFIGS = {
  deactivate: {
    title: "Deactivate Merchant",
    description: (name: string, visibility?: boolean, status?: string) =>
      `Deactivate ${name}. This will suspend their account.`,
    confirmText: "Suspend Merchant",
    confirmClass: "bg-red-600 hover:bg-red-700",
  },
  approve: {
    title: "Approve Merchant",
    description: (name: string, visibility?: boolean, status?: string) =>
      `Approve ${name} to activate their account?`,
    confirmText: "Yes, Approve",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  activate: {
    title: "Activate Merchant",
    description: (name: string, visibility?: boolean, status?: string) =>
      `Activate ${name} to allow transactions?`,
    confirmText: "Yes, Activate",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  adjustLimits: {
    title: "Adjust Limits",
    description: (name: string, visibility?: boolean, status?: string) =>
      `Adjust limits for ${name}.`,
    confirmText: "Update Limits",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  toggleVisibility: {
    title: "Toggle Visibility",
    description: (name: string, visibility?: boolean, status?: string) =>
      `Toggle visibility for ${name}.`,
    confirmText: "Toggle Visibility",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  toggleStatuses: {
    title: "Toggle Badges",
    description: (name: string, visibility?: boolean, status?: string) =>
      `Toggle Badges for ${name}.`,
    confirmText: "Update Badges",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  confirmVisibilityChange: {
    title: "Confirm Visibility Change",
    description: (name: string, visibility?: boolean, status?: string) =>
      `Are you sure you want to change visibility to ${
        visibility ? "Visible" : "Hidden"
      } for ${name}?`,
    confirmText: "Confirm",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  confirmStatusChange: {
    title: "Confirm Status Change",
    description: (name: string, visibility?: boolean, status?: string) =>
      `Are you sure you want to change status to ${status} for ${name}?`,
    confirmText: "Confirm",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  managePurchasedPackage: {
    title: "Manage Purchased Package",
    description: (name: string, visibility?: boolean, status?: string) =>
      `Update purchased package details for ${name}.`,
    confirmText: "Update Package",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
} as const;

const STATUS_ITEMS = [
  { key: "citywittyAssured" as const, label: "Citywitty Assured" },
  { key: "isVerified" as const, label: "Verified" },
  { key: "isPremiumSeller" as const, label: "Premium Seller" },
  { key: "isTopMerchant" as const, label: "Top Merchant" },
];

const DEFAULT_LIMITS: MerchantLimits = {
  ListingLimit: 0,
  totalGraphics: 0,
  totalReels: 0,
  isWebsite: false,
  totalPodcast: 0,
};

const DEFAULT_STATUSES: MerchantStatuses = {
  citywittyAssured: false,
  isVerified: false,
  isPremiumSeller: false,
  isTopMerchant: false,
};

const DEFAULT_PURCHASED_PACKAGE: PurchasedPackage = {
  variantName: "",
  purchaseDate: "",
  expiryDate: "",
  transactionId: "",
};

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
  isPremiumSeller: merchant.isPremiumSeller || false,
  isTopMerchant: merchant.isTopMerchant || false,
});

const initializePurchasedPackage = (merchant: Merchant): PurchasedPackage => ({
  variantName: merchant.purchasedPackage?.variantName || "",
  purchaseDate: merchant.purchasedPackage?.purchaseDate || "",
  expiryDate: merchant.purchasedPackage?.expiryDate || "",
  transactionId: merchant.purchasedPackage?.transactionId || "",
});

const getModalConfig = (
  type: ModalType,
  merchantName: string,
  newVisibility?: boolean,
  newStatus?: string
) => {
  if (!type || type === "view") return null;
  const config = MODAL_CONFIGS[type as keyof typeof MODAL_CONFIGS];
  if (!config) return null;

  return {
    ...config,
    description:
      typeof config.description === "function"
        ? config.description(merchantName, newVisibility, newStatus)
        : config.description,
  };
};

// State reducer
const modalStateReducer = (
  state: ModalState,
  action: ModalAction
): ModalState => {
  switch (action.type) {
    case "SET_SUSPENSION_REASON":
      return { ...state, suspensionReason: action.payload };
    case "SET_LIMITS":
      return { ...state, limits: { ...state.limits, ...action.payload } };
    case "SET_SECRET_CODE":
      return { ...state, secretCode: action.payload };
    case "SET_STATUSES":
      return { ...state, statuses: { ...state.statuses, ...action.payload } };
    case "SET_PURCHASED_PACKAGE":
      return {
        ...state,
        purchasedPackage: { ...state.purchasedPackage, ...action.payload },
      };
    case "SET_SHOW_CONFIRMATION":
      return { ...state, showConfirmation: action.payload };
    case "RESET":
      return {
        ...state,
        suspensionReason: "",
        limits: action.payload.limits,
        secretCode: "",
        statuses: action.payload.statuses,
        showConfirmation: false,
      };
    case "INITIALIZE_LIMITS":
      return { ...state, limits: action.payload, secretCode: "" };
    case "INITIALIZE_STATUSES":
      return { ...state, statuses: action.payload };
    case "INITIALIZE_PURCHASED_PACKAGE":
      return { ...state, purchasedPackage: action.payload };
    default:
      return state;
  }
};

// Memoized sub-component for suspension reason input
const SuspensionReasonInput = memo(
  ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <label htmlFor="suspensionReason" className="text-sm font-medium">
        Suspension Reason (Required)
      </label>
      <Textarea
        id="suspensionReason"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter the reason for suspending this merchant..."
        rows={3}
      />
    </div>
  )
);
SuspensionReasonInput.displayName = "SuspensionReasonInput";

// Memoized sub-component for limit input fields
const LimitInputField = memo(
  ({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    placeholder: string;
  }) => (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <label className="text-sm font-medium">{label}</label>
      <Input
        type="text"
        value={value || 0}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        placeholder={placeholder}
        className="mt-2"
      />
    </div>
  )
);
LimitInputField.displayName = "LimitInputField";

// Memoized sub-component for adjust limits form
const AdjustLimitsForm = memo(
  ({
    limits,
    secretCode,
    onLimitsChange,
    onSecretCodeChange,
  }: {
    limits: MerchantLimits;
    secretCode: string;
    onLimitsChange: (key: keyof MerchantLimits, value: any) => void;
    onSecretCodeChange: (value: string) => void;
  }) => (
    <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto">
      <LimitInputField
        label="Listing Limit"
        value={limits.ListingLimit}
        onChange={(val) => onLimitsChange("ListingLimit", val)}
        placeholder="Enter listing limit"
      />
      <LimitInputField
        label="Total Graphics"
        value={limits.totalGraphics}
        onChange={(val) => onLimitsChange("totalGraphics", val)}
        placeholder="Enter total graphics"
      />
      <LimitInputField
        label="Total Reels"
        value={limits.totalReels}
        onChange={(val) => onLimitsChange("totalReels", val)}
        placeholder="Enter total reels"
      />
      <LimitInputField
        label="Total Podcast"
        value={limits.totalPodcast}
        onChange={(val) => onLimitsChange("totalPodcast", val)}
        placeholder="Enter total podcast"
      />
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
        <label className="text-sm font-medium">Is Website</label>
        <Switch
          checked={limits.isWebsite}
          onCheckedChange={(checked) => onLimitsChange("isWebsite", checked)}
        />
      </div>
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <label className="text-sm font-medium">Secret Code</label>
        <Input
          type="password"
          value={secretCode}
          onChange={(e) => onSecretCodeChange(e.target.value)}
          placeholder="Enter secret code"
          className="mt-2"
        />
      </div>
    </div>
  )
);
AdjustLimitsForm.displayName = "AdjustLimitsForm";

// Memoized sub-component for status toggle item
const StatusToggleItem = memo(
  ({
    label,
    isEnabled,
    onChange,
  }: {
    label: string;
    isEnabled: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="flex-1">
        <h4 className="font-medium text-sm">{label}</h4>
        <Badge
          variant={isEnabled ? "default" : "destructive"}
          className={isEnabled ? "bg-green-500 text-white" : ""}
        >
          {isEnabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>
      <Switch checked={isEnabled} onCheckedChange={onChange} />
    </div>
  )
);
StatusToggleItem.displayName = "StatusToggleItem";

// Memoized sub-component for toggle statuses form
const ToggleStatusesForm = memo(
  ({
    statuses,
    onStatusChange,
  }: {
    statuses: MerchantStatuses;
    onStatusChange: (key: keyof MerchantStatuses, value: boolean) => void;
  }) => (
    <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto">
      {STATUS_ITEMS.map(({ key, label }) => (
        <StatusToggleItem
          key={key}
          label={label}
          isEnabled={statuses[key]}
          onChange={(checked) => onStatusChange(key, checked)}
        />
      ))}
    </div>
  )
);
ToggleStatusesForm.displayName = "ToggleStatusesForm";

// Memoized sub-component for purchased package input field
const PackageInputField = memo(
  ({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    type?: string;
  }) => {
    // Format date values to YYYY-MM-DD format for date inputs
    const displayValue = type === "date" && value ? value.split("T")[0] : value;

    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <label className="text-sm font-medium">{label}</label>
        <Input
          type={type}
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-2"
        />
      </div>
    );
  }
);
PackageInputField.displayName = "PackageInputField";

// Memoized sub-component for variant name select field
const PackageSelectField = memo(
  ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
  }) => (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-2">
          <SelectValue placeholder="Select a variant" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Launch Pad">Launch Pad</SelectItem>
          <SelectItem value="Scale Up">Scale Up</SelectItem>
          <SelectItem value="Market Leader">Market Leader</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
);
PackageSelectField.displayName = "PackageSelectField";

// Memoized sub-component for manage purchased package form
const ManagePurchasedPackageForm = memo(
  ({
    packageData,
    onPackageChange,
  }: {
    packageData: PurchasedPackage;
    onPackageChange: (key: keyof PurchasedPackage, value: string) => void;
  }) => (
    <div className="space-y-6 max-h-[400px] overflow-y-auto">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Package Details
        </h3>
        <div className="space-y-4">
          <PackageSelectField
            label="Variant Name"
            value={packageData.variantName}
            onChange={(val) => onPackageChange("variantName", val)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PackageInputField
              label="Purchase Date"
              value={packageData.purchaseDate}
              onChange={(val) => onPackageChange("purchaseDate", val)}
              placeholder="Select purchase date"
              type="date"
            />
            <PackageInputField
              label="Expiry Date"
              value={packageData.expiryDate}
              onChange={(val) => onPackageChange("expiryDate", val)}
              placeholder="Select expiry date"
              type="date"
            />
          </div>
          <PackageInputField
            label="Transaction ID"
            value={packageData.transactionId}
            onChange={(val) => onPackageChange("transactionId", val)}
            placeholder="Enter transaction ID"
          />
        </div>
      </div>
    </div>
  )
);
ManagePurchasedPackageForm.displayName = "ManagePurchasedPackageForm";

function MerchantActionModals({
  modal,
  onClose,
  onUpdateMerchantStatus,
  onUpdateMerchantVisibility,
  onUpdateMerchantLimits,
  onUpdateMerchantStatuses,
  onUpdatePurchasedPackage,
}: MerchantActionModalsProps) {
  // All hooks must be called before any early returns
  const [state, dispatch] = useReducer(modalStateReducer, {
    suspensionReason: "",
    limits: DEFAULT_LIMITS,
    secretCode: "",
    statuses: DEFAULT_STATUSES,
    purchasedPackage: DEFAULT_PURCHASED_PACKAGE,
    showConfirmation: false,
  });

  useEffect(() => {
    if (
      modal.type !== "deactivate" &&
      !(modal.type === "confirmStatusChange" && modal.newStatus === "suspended")
    ) {
      dispatch({ type: "SET_SUSPENSION_REASON", payload: "" });
    }
    if (modal.type === "adjustLimits" && modal.merchant) {
      dispatch({
        type: "INITIALIZE_LIMITS",
        payload: initializeLimits(modal.merchant),
      });
    }
    if (modal.type === "toggleStatuses" && modal.merchant) {
      dispatch({
        type: "INITIALIZE_STATUSES",
        payload: initializeStatuses(modal.merchant),
      });
    }
    if (modal.type === "managePurchasedPackage" && modal.merchant) {
      dispatch({
        type: "INITIALIZE_PURCHASED_PACKAGE",
        payload: initializePurchasedPackage(modal.merchant),
      });
    }
    dispatch({ type: "SET_SHOW_CONFIRMATION", payload: false });
  }, [modal.type, modal.merchant, modal.newStatus]);

  // Memoized handlers - all defined before early returns
  const merchant = modal.merchant!;

  const handleSimpleConfirm = useCallback(async () => {
    if (!modal.merchant) return;
    try {
      switch (modal.type) {
        case "approve":
        case "activate":
          await onUpdateMerchantStatus(modal.merchant._id, "active");
          break;
        case "deactivate":
          await onUpdateMerchantStatus(
            modal.merchant._id,
            "suspended",
            state.suspensionReason
          );
          break;
        case "toggleVisibility":
          await onUpdateMerchantVisibility(
            modal.merchant._id,
            !modal.merchant.visibility
          );
          break;
      }
      onClose();
    } catch (error) {
      console.error("Error in handleSimpleConfirm:", error);
    }
  }, [
    modal.type,
    modal.merchant,
    state.suspensionReason,
    onUpdateMerchantStatus,
    onUpdateMerchantVisibility,
    onClose,
  ]);

  const handleComplexConfirm = useCallback(async () => {
    if (!modal.merchant) return;
    try {
      switch (modal.type) {
        case "adjustLimits":
          if (state.secretCode !== "SuperSecret123") {
            toast.error("Invalid secret code");
            return;
          }
          await onUpdateMerchantLimits(
            modal.merchant._id,
            state.limits,
            state.secretCode
          );
          break;
        case "toggleStatuses":
          await onUpdateMerchantStatuses(modal.merchant._id, state.statuses);
          break;
        case "confirmVisibilityChange":
          await onUpdateMerchantVisibility(
            modal.merchant._id,
            modal.newVisibility!
          );
          break;
        case "confirmStatusChange":
          await onUpdateMerchantStatus(
            modal.merchant._id,
            modal.newStatus!,
            modal.newStatus === "suspended" ? state.suspensionReason : undefined
          );
          break;
        case "managePurchasedPackage":
          await onUpdatePurchasedPackage(
            modal.merchant._id,
            state.purchasedPackage
          );
          break;
      }
      onClose();
    } catch (error) {
      console.error("Error in handleComplexConfirm:", error);
    }
  }, [
    modal.type,
    modal.merchant,
    state.limits,
    state.secretCode,
    state.statuses,
    state.purchasedPackage,
    state.suspensionReason,
    modal.newVisibility,
    modal.newStatus,
    onUpdateMerchantLimits,
    onUpdateMerchantStatuses,
    onUpdateMerchantVisibility,
    onUpdateMerchantStatus,
    onUpdatePurchasedPackage,
    onClose,
  ]);

  const handleConfirmAction = useCallback(async () => {
    await handleComplexConfirm();
    dispatch({ type: "SET_SHOW_CONFIRMATION", payload: false });
  }, [handleComplexConfirm]);

  const handleMainConfirm = useCallback(async () => {
    await handleComplexConfirm();
  }, [handleComplexConfirm]);

  const handleConfirmClick = useCallback(() => {
    if (
      modal.type === "adjustLimits" ||
      modal.type === "toggleStatuses" ||
      modal.type === "managePurchasedPackage"
    ) {
      dispatch({ type: "SET_SHOW_CONFIRMATION", payload: true });
    } else if (
      modal.type === "confirmVisibilityChange" ||
      modal.type === "confirmStatusChange"
    ) {
      handleMainConfirm();
    } else {
      handleSimpleConfirm();
    }
  }, [modal.type, handleMainConfirm, handleSimpleConfirm]);

  const isConfirmDisabled = useMemo(() => {
    return (
      ((modal.type === "deactivate" ||
        (modal.type === "confirmStatusChange" &&
          modal.newStatus === "suspended")) &&
        !state.suspensionReason.trim()) ||
      (modal.type === "adjustLimits" && state.secretCode !== "SuperSecret123")
    );
  }, [modal.type, modal.newStatus, state.suspensionReason, state.secretCode]);

  const handleLimitsChange = useCallback(
    (key: keyof MerchantLimits, value: any) => {
      dispatch({ type: "SET_LIMITS", payload: { [key]: value } });
    },
    []
  );

  const handleStatusChange = useCallback(
    (key: keyof MerchantStatuses, value: boolean) => {
      dispatch({ type: "SET_STATUSES", payload: { [key]: value } });
    },
    []
  );

  const handlePackageChange = useCallback(
    (key: keyof PurchasedPackage, value: string) => {
      dispatch({ type: "SET_PURCHASED_PACKAGE", payload: { [key]: value } });
    },
    []
  );

  const content = useMemo(() => {
    if (!modal.merchant) return null;
    return getModalConfig(
      modal.type,
      modal.merchant.displayName,
      modal.newVisibility,
      modal.newStatus
    );
  }, [
    modal.type,
    modal.merchant?.displayName,
    modal.newVisibility,
    modal.newStatus,
  ]);

  // Early returns AFTER all hooks
  if (!modal.merchant) return null;
  if (!content) return null;

  return (
    <>
      <Dialog open={!!modal.type} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{content.title}</DialogTitle>
            <DialogDescription>{content.description}</DialogDescription>
          </DialogHeader>
          {(modal.type === "deactivate" ||
            (modal.type === "confirmStatusChange" &&
              modal.newStatus === "suspended")) && (
            <SuspensionReasonInput
              value={state.suspensionReason}
              onChange={(value) =>
                dispatch({ type: "SET_SUSPENSION_REASON", payload: value })
              }
            />
          )}
          {modal.type === "adjustLimits" && (
            <AdjustLimitsForm
              limits={state.limits}
              secretCode={state.secretCode}
              onLimitsChange={handleLimitsChange}
              onSecretCodeChange={(value) =>
                dispatch({ type: "SET_SECRET_CODE", payload: value })
              }
            />
          )}
          {modal.type === "toggleStatuses" && (
            <ToggleStatusesForm
              statuses={state.statuses}
              onStatusChange={handleStatusChange}
            />
          )}
          {modal.type === "managePurchasedPackage" && (
            <ManagePurchasedPackageForm
              packageData={state.purchasedPackage}
              onPackageChange={handlePackageChange}
            />
          )}
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={content.confirmClass}
              onClick={handleConfirmClick}
              disabled={isConfirmDisabled}
            >
              {content.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={state.showConfirmation}
        onOpenChange={(open) =>
          dispatch({ type: "SET_SHOW_CONFIRMATION", payload: open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {modal.type === "adjustLimits"
                ? "update the limits"
                : modal.type === "toggleStatuses"
                ? "update the statuses"
                : modal.type === "managePurchasedPackage"
                ? "update the purchased package"
                : "change the visibility"}{" "}
              for {merchant.displayName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                dispatch({ type: "SET_SHOW_CONFIRMATION", payload: false })
              }
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 mt-1"
              onClick={handleConfirmAction}
            >
              Yes, Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

MerchantActionModals.displayName = "MerchantActionModals";

export default memo(MerchantActionModals);
