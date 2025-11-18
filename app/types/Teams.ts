export interface IIncentivePercentageEntry {
  percentage: { [key: string]: number };
  effectiveFrom: string;
}

export interface IOnboardedMerchant {
  merchantID: string;
  name: string;
  email: string;
  package: string;
  revenue: number;
}

export interface IMonthlyOnboardRecord {
  year: number;
  month: number;
  revenueTarget: number;
  onboardedCount: number;
  onboardedMerchants: IOnboardedMerchant[];
  bonusRule?: {
    type: "perRevenue" | "fixed";
    amountPerRevenue?: number;
    fixedBonusAmount?: number;
  } | null;
  bonusAmount?: number;
  bonusCalculatedAt?: string;
  notes?: string;
}

export interface IEmployee {
  _id: string;
  empId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  joiningDate?: string;
  department?: string;
  branch?: string;
  role?: string;
  status: "active" | "suspended" | "terminated";
  defaultMonthlyRevenueTarget: number;
  defaultBonusRule: {
    type: "perRevenue" | "fixed";
    amountPerRevenue?: number;
    fixedBonusAmount?: number;
  };
  packagePrices?: { [key: string]: number };
  incentivePercentages?: { [key: string]: number };
  incentivePercentageHistory?: IIncentivePercentageEntry[];
  monthlyRecords: IMonthlyOnboardRecord[];
  totalOnboarded?: number;
  totalBonusEarned?: number;
  onboardingIncentiveEarned?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  suspendedEmployees: number;
  terminatedEmployees: number;
}

export type ModalType = "view" | "edit" | "create" | "delete" | "incentives" | "monthlyRecords" | "confirmStatusChange" | null;

export interface EmployeeFormData {
  empId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  joiningDate: string;
  department: string;
  branch: string;
  role: string;
  status: "active" | "suspended" | "terminated";
  defaultMonthlyRevenueTarget: number;
  defaultBonusRule: {
    type: "perRevenue" | "fixed";
    amountPerRevenue: number;
    fixedBonusAmount: number;
  };
}

export const INITIAL_FORM_DATA: EmployeeFormData = {
  empId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  joiningDate: "",
  department: "",
  branch: "",
  role: "onboarding_agent",
  status: "active",
  defaultMonthlyRevenueTarget: 10000,
  defaultBonusRule: {
    type: "perRevenue",
    amountPerRevenue: 0.1,
    fixedBonusAmount: 0,
  },
};

export const DEFAULT_INCENTIVE_PERCENTAGES = {
  "Launch Pad": 5,
  "Scale Up": 7,
  "Market Leader": 10,
};
