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

type OnboardingAgent = {
  agentId: string;
  agentName: string;
};

type DigitalSupportData = {
  ds_graphics: Array<{
    graphicId: string;
    requestDate: string;
    completionDate?: string;
    status: "completed" | "pending";
    requestCategory: string;
    content: string;
    subject: string;
    isSchedules?: boolean;
  }>;
  ds_reel: Array<{
    reelId: string;
    requestDate: string;
    completionDate?: string;
    status: "completed" | "pending";
    content: string;
    subject: string;
  }>;
  ds_weblog: Array<{
    weblog_id: string;
    status: "completed" | "pending";
    completionDate?: string;
    description: string;
  }>;
  podcastLog: Array<{
    title: string;
    status: "scheduled" | "completed" | "pending";
    scheduleDate: string;
    completeDate?: string;
  }>;
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
  onUpdateOnboardingAgent: (
    merchantId: string,
    agentData: OnboardingAgent
  ) => Promise<void>;
  onUpdateDigitalSupport?: (
    merchantId: string,
    digitalSupportData: DigitalSupportData
  ) => Promise<void>;
}

// State reducer type
type ModalState = {
  suspensionReason: string;
  limits: MerchantLimits;
  secretCode: string;
  statuses: MerchantStatuses;
  purchasedPackage: PurchasedPackage;
  onboardingAgent: OnboardingAgent;
  digitalSupportData: DigitalSupportData;
  showConfirmation: boolean;
};

type ModalAction =
  | { type: "SET_SUSPENSION_REASON"; payload: string }
  | { type: "SET_LIMITS"; payload: Partial<MerchantLimits> }
  | { type: "SET_SECRET_CODE"; payload: string }
  | { type: "SET_STATUSES"; payload: Partial<MerchantStatuses> }
  | { type: "SET_PURCHASED_PACKAGE"; payload: Partial<PurchasedPackage> }
  | { type: "SET_ONBOARDING_AGENT"; payload: Partial<OnboardingAgent> }
  | { type: "SET_DIGITAL_SUPPORT"; payload: Partial<DigitalSupportData> }
  | { type: "SET_SHOW_CONFIRMATION"; payload: boolean }
  | {
      type: "RESET";
      payload: { limits: MerchantLimits; statuses: MerchantStatuses };
    }
  | { type: "INITIALIZE_LIMITS"; payload: MerchantLimits }
  | { type: "INITIALIZE_STATUSES"; payload: MerchantStatuses }
  | { type: "INITIALIZE_PURCHASED_PACKAGE"; payload: PurchasedPackage }
  | { type: "INITIALIZE_ONBOARDING_AGENT"; payload: OnboardingAgent }
  | { type: "INITIALIZE_DIGITAL_SUPPORT"; payload: DigitalSupportData };

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
  addOnboardingAgent: {
    title: "Add Onboarding Agent",
    description: (name: string, visibility?: boolean, status?: string) =>
      `Assign an onboarding agent to ${name}.`,
    confirmText: "Save Agent",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  manageDigitalSupport: {
    title: "Add Digital Support Assets",
    description: (name: string, visibility?: boolean, status?: string) =>
      `Add new digital support assets for ${name}: Graphics, Reels, Podcasts, and Weblogs.`,
    confirmText: "Save Assets",
    confirmClass: "bg-blue-600 hover:bg-blue-700",
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

const DEFAULT_ONBOARDING_AGENT: OnboardingAgent = {
  agentId: "",
  agentName: "",
};

const DEFAULT_DIGITAL_SUPPORT_DATA: DigitalSupportData = {
  ds_graphics: [],
  ds_reel: [],
  ds_weblog: [],
  podcastLog: [],
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

const initializeOnboardingAgent = (merchant: Merchant): OnboardingAgent => ({
  agentId: merchant.onboardingAgent?.agentId || "",
  agentName: merchant.onboardingAgent?.agentName || "",
});

const initializeDigitalSupportData = (
  merchant: Merchant
): DigitalSupportData => ({
  ds_graphics: (merchant.ds_graphics || []) as Array<{
    graphicId: string;
    requestDate: string;
    completionDate?: string;
    status: "completed" | "pending";
    requestCategory: string;
    content: string;
    subject: string;
    isSchedules?: boolean;
  }>,
  ds_reel: (merchant.ds_reel || []) as Array<{
    reelId: string;
    requestDate: string;
    completionDate?: string;
    status: "completed" | "pending";
    content: string;
    subject: string;
  }>,
  ds_weblog: (merchant.ds_weblog || []) as Array<{
    weblog_id: string;
    status: "completed" | "pending";
    completionDate?: string;
    description: string;
  }>,
  podcastLog: (merchant.podcastLog || []) as Array<{
    title: string;
    status: "scheduled" | "completed" | "pending";
    scheduleDate: string;
    completeDate?: string;
  }>,
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
    case "SET_ONBOARDING_AGENT":
      return {
        ...state,
        onboardingAgent: { ...state.onboardingAgent, ...action.payload },
      };
    case "SET_DIGITAL_SUPPORT":
      return {
        ...state,
        digitalSupportData: { ...state.digitalSupportData, ...action.payload },
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
    case "INITIALIZE_ONBOARDING_AGENT":
      return { ...state, onboardingAgent: action.payload };
    case "INITIALIZE_DIGITAL_SUPPORT":
      return { ...state, digitalSupportData: action.payload };
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

// Memoized sub-component for onboarding agent input field
const AgentInputField = memo(
  ({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
  }) => (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <label className="text-sm font-medium">{label}</label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2"
      />
    </div>
  )
);
AgentInputField.displayName = "AgentInputField";

// Memoized sub-component for add onboarding agent form
const AddOnboardingAgentForm = memo(
  ({
    agentData,
    onAgentChange,
  }: {
    agentData: OnboardingAgent;
    onAgentChange: (key: keyof OnboardingAgent, value: string) => void;
  }) => (
    <div className="space-y-6 max-h-[400px] overflow-y-auto">
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
          Onboarding Agent Details
        </h3>
        <div className="space-y-4">
          <AgentInputField
            label="Agent ID"
            value={agentData.agentId}
            onChange={(val) => onAgentChange("agentId", val)}
            placeholder="Enter agent ID"
          />
          <AgentInputField
            label="Agent Name"
            value={agentData.agentName}
            onChange={(val) => onAgentChange("agentName", val)}
            placeholder="Enter agent name"
          />
        </div>
      </div>
    </div>
  )
);
AddOnboardingAgentForm.displayName = "AddOnboardingAgentForm";

// Digital Support Form Component with Tabs - Add New Assets
const DigitalSupportForm = memo(
  ({
    digitalData,
    onDigitalChange,
    merchantId,
    limits,
  }: {
    digitalData: DigitalSupportData;
    onDigitalChange: (field: keyof DigitalSupportData, value: any) => void;
    merchantId?: string;
    limits?: MerchantLimits;
  }) => {
    const [activeTab, setActiveTab] = React.useState<
      "graphics" | "reels" | "podcasts" | "weblogs"
    >("graphics");

    // Graphics form state
    const [graphicsForm, setGraphicsForm] = React.useState({
      graphicId: "",
      requestCategory: "",
      content: "",
      subject: "",
      isSchedules: false,
    });

    // Reels form state
    const [reelsForm, setReelsForm] = React.useState({
      reelId: "",
      content: "",
      subject: "",
    });

    // Podcasts form state
    const [podcastsForm, setPodcastsForm] = React.useState({
      title: "",
      scheduleDate: "",
    });

    // Weblogs form state
    const [weblogsForm, setWeblogsForm] = React.useState({
      weblog_id: "",
      description: "",
    });

    // Generate unique ID with format: 3-letter prefix + 5 random alphanumeric
    const generateUniqueId = (prefix: string): string => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let randomPart = "";
      for (let i = 0; i < 10; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return `${prefix}${"-"}${randomPart}`;
    };

    const addGraphic = () => {
      if (!graphicsForm.graphicId || !graphicsForm.subject) {
        toast.error("Please fill in Graphic ID and Subject");
        return;
      }

      // Check if adding would exceed the limit
      if (limits && digitalData.ds_graphics.length >= limits.totalGraphics) {
        toast.error(
          `Graphics limit reached. Maximum: ${limits.totalGraphics}, Current: ${digitalData.ds_graphics.length}`
        );
        return;
      }

      const newGraphic = {
        ...graphicsForm,
        requestDate: new Date().toISOString(),
        status: "pending" as const,
      };
      onDigitalChange("ds_graphics", [...digitalData.ds_graphics, newGraphic]);
      setGraphicsForm({
        graphicId: "",
        requestCategory: "",
        content: "",
        subject: "",
        isSchedules: false,
      });
      toast.success("Graphic added successfully");
    };

    const addReel = () => {
      if (!reelsForm.reelId || !reelsForm.subject) {
        toast.error("Please fill in Reel ID and Subject");
        return;
      }

      // Check if adding would exceed the limit
      if (limits && digitalData.ds_reel.length >= limits.totalReels) {
        toast.error(
          `Reels limit reached. Maximum: ${limits.totalReels}, Current: ${digitalData.ds_reel.length}`
        );
        return;
      }

      const newReel = {
        ...reelsForm,
        requestDate: new Date().toISOString(),
        status: "pending" as const,
      };
      onDigitalChange("ds_reel", [...digitalData.ds_reel, newReel]);
      setReelsForm({ reelId: "", content: "", subject: "" });
      toast.success("Reel added successfully");
    };

    const addPodcast = () => {
      if (!podcastsForm.title || !podcastsForm.scheduleDate) {
        toast.error("Please fill in Title and Schedule Date");
        return;
      }

      // Check if adding would exceed the limit
      if (limits && digitalData.podcastLog.length >= limits.totalPodcast) {
        toast.error(
          `Podcasts limit reached. Maximum: ${limits.totalPodcast}, Current: ${digitalData.podcastLog.length}`
        );
        return;
      }

      const newPodcast = {
        ...podcastsForm,
        scheduleDate: new Date(podcastsForm.scheduleDate).toISOString(),
        status: "pending" as const,
      };
      onDigitalChange("podcastLog", [...digitalData.podcastLog, newPodcast]);
      setPodcastsForm({ title: "", scheduleDate: "" });
      toast.success("Podcast added successfully");
    };

    const addWeblog = () => {
      if (!weblogsForm.weblog_id || !weblogsForm.description) {
        toast.error("Please fill in Weblog ID and Description");
        return;
      }
      const newWeblog = {
        ...weblogsForm,
        status: "pending" as const,
      };
      onDigitalChange("ds_weblog", [...digitalData.ds_weblog, newWeblog]);
      setWeblogsForm({ weblog_id: "", description: "" });
      toast.success("Weblog added successfully");
    };

    const removeGraphic = async (idx: number) => {
      const graphic = digitalData.ds_graphics[idx];

      // Remove from UI immediately
      onDigitalChange(
        "ds_graphics",
        digitalData.ds_graphics.filter((_, i) => i !== idx)
      );
      toast.success("Graphic removed");

      // Delete from database if item has graphicId and merchantId exists
      if (graphic.graphicId && merchantId) {
        try {
          const res = await fetch(
            `/api/merchants/${merchantId}/digital-support`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "graphic",
                itemId: graphic.graphicId,
              }),
            }
          );
          if (!res.ok) {
            throw new Error("Failed to delete graphic from database");
          }
        } catch (error) {
          console.error("Error deleting graphic:", error);
          toast.error("Failed to delete graphic from database");
        }
      }
    };

    const removeReel = async (idx: number) => {
      const reel = digitalData.ds_reel[idx];

      // Remove from UI immediately
      onDigitalChange(
        "ds_reel",
        digitalData.ds_reel.filter((_, i) => i !== idx)
      );
      toast.success("Reel removed");

      // Delete from database if item has reelId and merchantId exists
      if (reel.reelId && merchantId) {
        try {
          const res = await fetch(
            `/api/merchants/${merchantId}/digital-support`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "reel", itemId: reel.reelId }),
            }
          );
          if (!res.ok) {
            throw new Error("Failed to delete reel from database");
          }
        } catch (error) {
          console.error("Error deleting reel:", error);
          toast.error("Failed to delete reel from database");
        }
      }
    };

    const removePodcast = async (idx: number) => {
      const podcast = digitalData.podcastLog[idx];

      // Remove from UI immediately
      onDigitalChange(
        "podcastLog",
        digitalData.podcastLog.filter((_, i) => i !== idx)
      );
      toast.success("Podcast removed");

      // Delete from database if item has title and merchantId exists
      if (podcast.title && merchantId) {
        try {
          const res = await fetch(
            `/api/merchants/${merchantId}/digital-support`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "podcast", itemId: podcast.title }),
            }
          );
          if (!res.ok) {
            throw new Error("Failed to delete podcast from database");
          }
        } catch (error) {
          console.error("Error deleting podcast:", error);
          toast.error("Failed to delete podcast from database");
        }
      }
    };

    const removeWeblog = async (idx: number) => {
      const weblog = digitalData.ds_weblog[idx];

      // Remove from UI immediately
      onDigitalChange(
        "ds_weblog",
        digitalData.ds_weblog.filter((_, i) => i !== idx)
      );
      toast.success("Weblog removed");

      // Delete from database if item has weblog_id and merchantId exists
      if (weblog.weblog_id && merchantId) {
        try {
          const res = await fetch(
            `/api/merchants/${merchantId}/digital-support`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "weblog",
                itemId: weblog.weblog_id,
              }),
            }
          );
          if (!res.ok) {
            throw new Error("Failed to delete weblog from database");
          }
        } catch (error) {
          console.error("Error deleting weblog:", error);
          toast.error("Failed to delete weblog from database");
        }
      }
    };

    const updateGraphicStatus = async (idx: number, newStatus: "completed" | "pending") => {
      const graphic = digitalData.ds_graphics[idx];

      // Update UI immediately
      const updatedGraphics = [...digitalData.ds_graphics];
      updatedGraphics[idx] = {
        ...graphic,
        status: newStatus,
        completionDate: newStatus === "completed" ? new Date().toISOString() : undefined,
      };
      onDigitalChange("ds_graphics", updatedGraphics);
      toast.success(`Graphic status updated to ${newStatus}`);

      // Update in database if item has graphicId and merchantId exists
      if (graphic.graphicId && merchantId) {
        try {
          const res = await fetch(
            `/api/merchants/${merchantId}/digital-support`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "graphic",
                itemId: graphic.graphicId,
                status: newStatus,
                completionDate:
                  newStatus === "completed"
                    ? new Date().toISOString()
                    : undefined,
              }),
            }
          );
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("API Error Response:", res.status, errorData);
            throw new Error(errorData.error || "Failed to update graphic status in database");
          }
        } catch (error) {
          console.error("Error updating graphic status:", error);
          toast.error(error instanceof Error ? error.message : "Failed to update graphic status in database");
        }
      }
    };

    const updateReelStatus = async (idx: number, newStatus: "completed" | "pending") => {
      const reel = digitalData.ds_reel[idx];

      // Update UI immediately
      const updatedReels = [...digitalData.ds_reel];
      updatedReels[idx] = {
        ...reel,
        status: newStatus,
        completionDate: newStatus === "completed" ? new Date().toISOString() : undefined,
      };
      onDigitalChange("ds_reel", updatedReels);
      toast.success(`Reel status updated to ${newStatus}`);

      // Update in database if item has reelId and merchantId exists
      if (reel.reelId && merchantId) {
        try {
          const res = await fetch(
            `/api/merchants/${merchantId}/digital-support`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "reel",
                itemId: reel.reelId,
                status: newStatus,
                completionDate:
                  newStatus === "completed"
                    ? new Date().toISOString()
                    : undefined,
              }),
            }
          );
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("API Error Response:", res.status, errorData);
            throw new Error(errorData.error || "Failed to update reel status in database");
          }
        } catch (error) {
          console.error("Error updating reel status:", error);
          toast.error(error instanceof Error ? error.message : "Failed to update reel status in database");
        }
      }
    };

    const updatePodcastStatus = async (
      idx: number,
      newStatus: "scheduled" | "completed" | "pending"
    ) => {
      const podcast = digitalData.podcastLog[idx];

      // Update UI immediately
      const updatedPodcasts = [...digitalData.podcastLog];
      updatedPodcasts[idx] = {
        ...podcast,
        status: newStatus,
        completeDate:
          newStatus === "completed" ? new Date().toISOString() : undefined,
      };
      onDigitalChange("podcastLog", updatedPodcasts);
      toast.success(`Podcast status updated to ${newStatus}`);

      // Update in database if item has title and merchantId exists
      if (podcast.title && merchantId) {
        try {
          const res = await fetch(
            `/api/merchants/${merchantId}/digital-support`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "podcast",
                itemId: podcast.title,
                status: newStatus,
                completeDate:
                  newStatus === "completed"
                    ? new Date().toISOString()
                    : undefined,
              }),
            }
          );
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("API Error Response:", res.status, errorData);
            throw new Error(errorData.error || "Failed to update podcast status in database");
          }
        } catch (error) {
          console.error("Error updating podcast status:", error);
          toast.error(error instanceof Error ? error.message : "Failed to update podcast status in database");
        }
      }
    };

    const updateWeblogStatus = async (idx: number, newStatus: "completed" | "pending") => {
      const weblog = digitalData.ds_weblog[idx];

      // Update UI immediately
      const updatedWeblogs = [...digitalData.ds_weblog];
      updatedWeblogs[idx] = {
        ...weblog,
        status: newStatus,
        completionDate: newStatus === "completed" ? new Date().toISOString() : undefined,
      };
      onDigitalChange("ds_weblog", updatedWeblogs);
      toast.success(`Weblog status updated to ${newStatus}`);

      // Update in database if item has weblog_id and merchantId exists
      if (weblog.weblog_id && merchantId) {
        try {
          const res = await fetch(
            `/api/merchants/${merchantId}/digital-support`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "weblog",
                itemId: weblog.weblog_id,
                status: newStatus,
                completionDate:
                  newStatus === "completed"
                    ? new Date().toISOString()
                    : undefined,
              }),
            }
          );
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("API Error Response:", res.status, errorData);
            throw new Error(errorData.error || "Failed to update weblog status in database");
          }
        } catch (error) {
          console.error("Error updating weblog status:", error);
          toast.error(error instanceof Error ? error.message : "Failed to update weblog status in database");
        }
      }
    };

    const renderGraphicsSection = () => (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
              Add New Graphic
            </h4>
            {limits && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  digitalData.ds_graphics.length >= limits.totalGraphics
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                }`}
              >
                {digitalData.ds_graphics.length}/{limits.totalGraphics}
              </span>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Graphic ID *</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={graphicsForm.graphicId}
                  onChange={(e) =>
                    setGraphicsForm({
                      ...graphicsForm,
                      graphicId: e.target.value,
                    })
                  }
                  placeholder="e.g., GRAXYZ123"
                  className="flex-1"
                  readOnly={true}
                />
                <Button
                  type="button"
                  onClick={() =>
                    setGraphicsForm({
                      ...graphicsForm,
                      graphicId: generateUniqueId("GRA"),
                    })
                  }
                  className="bg-green-600 hover:bg-green-700 px-4"
                >
                  Generate
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Subject *</label>
              <Input
                value={graphicsForm.subject}
                onChange={(e) =>
                  setGraphicsForm({ ...graphicsForm, subject: e.target.value })
                }
                placeholder="e.g., Product Banner"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Category</label>
              <Input
                value={graphicsForm.requestCategory}
                onChange={(e) =>
                  setGraphicsForm({
                    ...graphicsForm,
                    requestCategory: e.target.value,
                  })
                }
                placeholder="e.g., Social Media"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Content</label>
              <Textarea
                value={graphicsForm.content}
                onChange={(e) =>
                  setGraphicsForm({ ...graphicsForm, content: e.target.value })
                }
                placeholder="Describe the graphic content"
                className="mt-1 resize-none"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={graphicsForm.isSchedules}
                onCheckedChange={(checked) =>
                  setGraphicsForm({ ...graphicsForm, isSchedules: checked })
                }
              />
              <label className="text-xs font-medium">Scheduled</label>
            </div>
            <Button
              onClick={addGraphic}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Add Graphic
            </Button>
          </div>
        </div>

        {digitalData.ds_graphics.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-semibold text-sm">
              Added Graphics ({digitalData.ds_graphics.length})
            </h5>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {digitalData.ds_graphics.map((graphic, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{graphic.subject}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      ID: {graphic.graphicId}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-xs font-medium">Status:</label>
                      <Select
                        value={graphic.status}
                        onValueChange={(value) =>
                          updateGraphicStatus(idx, value as "completed" | "pending")
                        }
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGraphic(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    const renderReelsSection = () => (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
              Add New Reel
            </h4>
            {limits && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  digitalData.ds_reel.length >= limits.totalReels
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                }`}
              >
                {digitalData.ds_reel.length}/{limits.totalReels}
              </span>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Reel ID *</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={reelsForm.reelId}
                  onChange={(e) =>
                    setReelsForm({ ...reelsForm, reelId: e.target.value })
                  }
                  placeholder="e.g., REEXYZ123"
                  className="flex-1"
                  readOnly={true}
                />
                <Button
                  type="button"
                  onClick={() =>
                    setReelsForm({
                      ...reelsForm,
                      reelId: generateUniqueId("REE"),
                    })
                  }
                  className="bg-green-600 hover:bg-green-700 px-4"
                >
                  Generate
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Subject *</label>
              <Input
                value={reelsForm.subject}
                onChange={(e) =>
                  setReelsForm({ ...reelsForm, subject: e.target.value })
                }
                placeholder="e.g., Product Showcase"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Content</label>
              <Textarea
                value={reelsForm.content}
                onChange={(e) =>
                  setReelsForm({ ...reelsForm, content: e.target.value })
                }
                placeholder="Describe the reel content"
                className="mt-1 resize-none"
                rows={2}
              />
            </div>
            <Button
              onClick={addReel}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Add Reel
            </Button>
          </div>
        </div>

        {digitalData.ds_reel.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-semibold text-sm">
              Added Reels ({digitalData.ds_reel.length})
            </h5>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {digitalData.ds_reel.map((reel, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{reel.subject}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      ID: {reel.reelId}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-xs font-medium">Status:</label>
                      <Select
                        value={reel.status}
                        onValueChange={(value) =>
                          updateReelStatus(idx, value as "completed" | "pending")
                        }
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReel(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    const renderPodcastsSection = () => (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
              Add New Podcast
            </h4>
            {limits && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  digitalData.podcastLog.length >= limits.totalPodcast
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                }`}
              >
                {digitalData.podcastLog.length}/{limits.totalPodcast}
              </span>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Title *</label>
              <Input
                value={podcastsForm.title}
                onChange={(e) =>
                  setPodcastsForm({ ...podcastsForm, title: e.target.value })
                }
                placeholder="e.g., Episode 1: Getting Started"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Schedule Date *</label>
              <Input
                type="date"
                value={podcastsForm.scheduleDate}
                onChange={(e) =>
                  setPodcastsForm({
                    ...podcastsForm,
                    scheduleDate: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>
            <Button
              onClick={addPodcast}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Add Podcast
            </Button>
          </div>
        </div>

        {digitalData.podcastLog.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-semibold text-sm">
              Added Podcasts ({digitalData.podcastLog.length})
            </h5>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {digitalData.podcastLog.map((podcast, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{podcast.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Scheduled:{" "}
                      {new Date(podcast.scheduleDate).toLocaleDateString()}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {podcast.status}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePodcast(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    const renderWeblogsSection = () => (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-4">
            Add New Weblog
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Weblog ID *</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={weblogsForm.weblog_id}
                  onChange={(e) =>
                    setWeblogsForm({ ...weblogsForm, weblog_id: e.target.value })
                  }
                  placeholder="e.g., WEBXYZ123"
                  className="flex-1"
                  readOnly={true}
                />
                <Button
                  type="button"
                  onClick={() =>
                    setWeblogsForm({
                      ...weblogsForm,
                      weblog_id: generateUniqueId("WEB"),
                    })
                  }
                  className="bg-green-600 hover:bg-green-700 px-4"
                >
                  Generate
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Description *</label>
              <Textarea
                value={weblogsForm.description}
                onChange={(e) =>
                  setWeblogsForm({
                    ...weblogsForm,
                    description: e.target.value,
                  })
                }
                placeholder="Enter weblog description"
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
            <Button
              onClick={addWeblog}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Add Weblog
            </Button>
          </div>
        </div>

        {digitalData.ds_weblog.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-semibold text-sm">
              Added Weblogs ({digitalData.ds_weblog.length})
            </h5>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {digitalData.ds_weblog.map((weblog, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{weblog.weblog_id}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {weblog.description}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {weblog.status}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWeblog(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeTab === "graphics" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("graphics")}
            className="text-xs"
          >
            📊 Graphics ({digitalData.ds_graphics.length})
          </Button>
          <Button
            variant={activeTab === "reels" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("reels")}
            className="text-xs"
          >
            🎬 Reels ({digitalData.ds_reel.length})
          </Button>
          <Button
            variant={activeTab === "podcasts" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("podcasts")}
            className="text-xs"
          >
            🎙️ Podcasts ({digitalData.podcastLog.length})
          </Button>
          <Button
            variant={activeTab === "weblogs" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("weblogs")}
            className="text-xs"
          >
            📝 Weblogs ({digitalData.ds_weblog.length})
          </Button>
        </div>

        <div className="">
          {activeTab === "graphics" && renderGraphicsSection()}
          {activeTab === "reels" && renderReelsSection()}
          {activeTab === "podcasts" && renderPodcastsSection()}
          {activeTab === "weblogs" && renderWeblogsSection()}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-3">
          <div>
            <p className="font-semibold mb-2">📊 Merchant Overview:</p>
            <ul className="space-y-1 ml-2 text-xs">
              <li>
                • Listing Limit:{" "}
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {limits?.ListingLimit ?? 0}
                </span>
              </li>
              <li>
                • Graphics Limit:{" "}
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {digitalData.ds_graphics.length}/{limits?.totalGraphics ?? 0}
                </span>{" "}
              </li>
              <li>
                • Reels Limit:{" "}
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {digitalData.ds_reel.length}/{limits?.totalReels ?? 0}
                </span>
                
              </li>
              <li>
                • Podcasts Limit:{" "}
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {digitalData.podcastLog.length}/{limits?.totalPodcast ?? 0}
                </span>
              </li>
              <li>
                • Weblogs:{" "}
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {digitalData.ds_weblog.length}
                </span>
              </li>
              <li>
                • Website:{" "}
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {limits?.isWebsite ? "Enabled" : "Disabled"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
);
DigitalSupportForm.displayName = "DigitalSupportForm";

function MerchantActionModals({
  modal,
  onClose,
  onUpdateMerchantStatus,
  onUpdateMerchantVisibility,
  onUpdateMerchantLimits,
  onUpdateMerchantStatuses,
  onUpdatePurchasedPackage,
  onUpdateOnboardingAgent,
  onUpdateDigitalSupport,
}: MerchantActionModalsProps) {
  // All hooks must be called before any early returns
  const [state, dispatch] = useReducer(modalStateReducer, {
    suspensionReason: "",
    limits: DEFAULT_LIMITS,
    secretCode: "",
    statuses: DEFAULT_STATUSES,
    purchasedPackage: DEFAULT_PURCHASED_PACKAGE,
    onboardingAgent: DEFAULT_ONBOARDING_AGENT,
    digitalSupportData: DEFAULT_DIGITAL_SUPPORT_DATA,
    showConfirmation: false,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset submitting state when modal type changes
  useEffect(() => {
    setIsSubmitting(false);
  }, [modal.type]);

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
    if (modal.type === "addOnboardingAgent" && modal.merchant) {
      dispatch({
        type: "INITIALIZE_ONBOARDING_AGENT",
        payload: initializeOnboardingAgent(modal.merchant),
      });
    }
    if (modal.type === "manageDigitalSupport" && modal.merchant) {
      dispatch({
        type: "INITIALIZE_DIGITAL_SUPPORT",
        payload: initializeDigitalSupportData(modal.merchant),
      });
      dispatch({
        type: "INITIALIZE_LIMITS",
        payload: initializeLimits(modal.merchant),
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
    if (!modal.merchant || isSubmitting) return;
    setIsSubmitting(true);
    try {
      switch (modal.type) {
        case "adjustLimits":
          if (state.secretCode !== "SuperSecret123") {
            toast.error("Invalid secret code");
            setIsSubmitting(false);
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
        case "addOnboardingAgent":
          await onUpdateOnboardingAgent(
            modal.merchant._id,
            state.onboardingAgent
          );
          break;
        case "manageDigitalSupport":
          if (onUpdateDigitalSupport) {
            await onUpdateDigitalSupport(
              modal.merchant._id,
              state.digitalSupportData
            );
          }
          break;
      }
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Error in handleComplexConfirm:", error);
      setIsSubmitting(false);
    }
  }, [
    modal.type,
    modal.merchant,
    state.limits,
    state.secretCode,
    state.statuses,
    state.purchasedPackage,
    state.onboardingAgent,
    state.digitalSupportData,
    state.suspensionReason,
    modal.newVisibility,
    modal.newStatus,
    onUpdateMerchantLimits,
    onUpdateMerchantStatuses,
    onUpdateMerchantVisibility,
    onUpdateMerchantStatus,
    onUpdatePurchasedPackage,
    onUpdateOnboardingAgent,
    onUpdateDigitalSupport,
    onClose,
    isSubmitting,
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
      modal.type === "managePurchasedPackage" ||
      modal.type === "addOnboardingAgent" ||
      modal.type === "manageDigitalSupport"
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

  const handleAgentChange = useCallback(
    (key: keyof OnboardingAgent, value: string) => {
      dispatch({ type: "SET_ONBOARDING_AGENT", payload: { [key]: value } });
    },
    []
  );

  const handleDigitalSupportChange = useCallback(
    (field: keyof DigitalSupportData, value: any) => {
      dispatch({ type: "SET_DIGITAL_SUPPORT", payload: { [field]: value } });
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
          {modal.type === "addOnboardingAgent" && (
            <AddOnboardingAgentForm
              agentData={state.onboardingAgent}
              onAgentChange={handleAgentChange}
            />
          )}
          {modal.type === "manageDigitalSupport" && (
            <DigitalSupportForm
              digitalData={state.digitalSupportData}
              onDigitalChange={handleDigitalSupportChange}
              merchantId={modal.merchant?._id}
              limits={state.limits}
            />
          )}
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={content.confirmClass}
              onClick={handleConfirmClick}
              disabled={isConfirmDisabled || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : content.confirmText}
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
                : modal.type === "addOnboardingAgent"
                ? "add the onboarding agent"
                : modal.type === "manageDigitalSupport"
                ? "add the digital support assets"
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Yes, Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

MerchantActionModals.displayName = "MerchantActionModals";

export default memo(MerchantActionModals);
