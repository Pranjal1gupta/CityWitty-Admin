// models/Employee.ts
import mongoose, { Schema, Document } from "mongoose";

export type BonusCalcType = "perRevenue" | "fixed";

export interface IBonusRule {
  type: BonusCalcType;
  // used when type === 'perRevenue'
  amountPerRevenue?: number; // currency units per unit of excess revenue
  // used when type === 'fixed'
  fixedBonusAmount?: number; // fixed bonus when target exceeded
}

export interface IIncentivePercentageEntry {
  percentage: { [key: string]: number }; // percentages per package
  effectiveFrom: Date; // when this percentage becomes active
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
  month: number; // 1-12
  revenueTarget: number; // revenue target for the month
  onboardedCount: number; // number of merchants actually onboarded this month
  onboardedMerchants: IOnboardedMerchant[]; // list of onboarded merchants
  bonusRule?: IBonusRule | null; // optional per-month override
  bonusAmount?: number; // computed bonus for the month
  bonusCalculatedAt?: Date;
  notes?: string;
}

export interface IEmployee extends Document {
  empId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  joiningDate?: Date;
  department?: string;
  branch?: string;
  role?: string;
  status?: "active" | "suspended" | "terminated";
  defaultMonthlyRevenueTarget: number; // default revenue target if not set in monthly record
  defaultBonusRule: IBonusRule;
  packagePrices: { [key: string]: number }; // dynamic package prices
  incentivePercentages: { [key: string]: number }; // current/active incentive percentages per package
  incentivePercentageHistory: IIncentivePercentageEntry[]; // historical record of incentive percentage changes

  monthlyRecords: IMonthlyOnboardRecord[];

  // convenience totals
  totalOnboarded?: number;
  totalBonusEarned?: number;
  onboardingIncentiveEarned?: number;

  // helper methods
  getIncentivePercentageForDate(packageName: string, date: Date): number;
  registerOnboardedMerchant(merchant: IOnboardedMerchant, year?: number, month?: number): Promise<void>;
  computeAndPersistMonthlyBonus(year: number, month: number): Promise<number>;
}

const BonusRuleSchema = new Schema(
  {
    type: { type: String, enum: ["perRevenue", "fixed"], required: true },
    amountPerRevenue: { type: Number, min: 0 }, // used when perRevenue
    fixedBonusAmount: { type: Number, min: 0 }, // used when fixed
  },
  { _id: false }
);

const IncentivePercentageEntrySchema = new Schema(
  {
    percentage: { type: Object, required: true }, // { "Launch Pad": 5, "Scale Up": 7, ... }
    effectiveFrom: { type: Date, required: true, index: true },
  },
  { _id: false }
);

const OnboardedMerchantSchema = new Schema(
  {
    merchantID: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    package: { type: String, required: true },
    revenue: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const MonthlyOnboardSchema = new Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    revenueTarget: { type: Number, required: true, default: 0 },
    onboardedCount: { type: Number, required: true, default: 0 },
    onboardedMerchants: [{ type: OnboardedMerchantSchema }],
    bonusRule: { type: BonusRuleSchema, default: null },
    bonusAmount: { type: Number, default: 0, min: 0 },
    bonusCalculatedAt: { type: Date },
    notes: { type: String },
  },
  { _id: false }
);

const EmployeeSchema = new Schema(
  {
    empId: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String },

    email: { type: String, index: true },
    phone: { type: String },
    address: { type: String },
    password: { type: String },
    joiningDate: { type: Date },
    department: { type: String },
    branch: { type: String },
    role: { type: String },

    status: { type: String, enum: ["active", "suspended", "terminated"], default: "active" },

    // default month revenue target and bonus rule (applies when monthly record doesn't override)
    defaultMonthlyRevenueTarget: { type: Number, required: true, default: 10000 }, // example default revenue target
    defaultBonusRule: { type: BonusRuleSchema, required: true, default: { type: "perRevenue", amountPerRevenue: 0.1 } },
    packagePrices: { type: Object, default: { "Launch Pad": 5000, "Scale Up": 10000, "Market Leader": 15000 } }, // dynamic package prices
    incentivePercentages: { type: Object, default: { "Launch Pad": 5, "Scale Up": 7, "Market Leader": 10 } }, // dynamic incentive percentages per package
    incentivePercentageHistory: { type: [IncentivePercentageEntrySchema], default: [] }, // track historical changes

    monthlyRecords: { type: [MonthlyOnboardSchema], default: [] },

    totalOnboarded: { type: Number, default: 0 },
    totalBonusEarned: { type: Number, default: 0 },
    onboardingIncentiveEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// compound index to find month fast
EmployeeSchema.index({ empId: 1, "monthlyRecords.year": 1, "monthlyRecords.month": 1 });

// Pre-save hook to set default password if not provided
EmployeeSchema.pre('save', function (next) {
  if (!this.password && this.email) {
    this.password = this.email;
  }
  next();
});

/**
 * Helper: compute bonus for given rule, target and totalRevenue
 */
function computeBonusFromRule(rule: IBonusRule | null | undefined, target: number, totalRevenue: number): number {
  if (!rule) return 0;
  const excess = Math.max(0, totalRevenue - target);
  if (excess <= 0) return 0;

  if (rule.type === "perRevenue") {
    const amt = rule.amountPerRevenue || 0;
    return excess * amt;
  }

  // fixed
  if (rule.type === "fixed") {
    return rule.fixedBonusAmount || 0;
  }

  return 0;
}

/**
 * Helper: get applicable incentive percentage for a package on a given date
 * Returns the percentage that was active on that date from history, or current percentage if no history
 */
function getApplicableIncentivePercentage(
  employee: IEmployee,
  packageName: string,
  date: Date
): number {
  const history = employee.incentivePercentageHistory || [];
  
  // Find the latest entry that is effective on or before the given date
  const applicableEntry = history
    .filter(entry => new Date(entry.effectiveFrom) <= date)
    .sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime())
    .at(0);

  if (applicableEntry) {
    return applicableEntry.percentage[packageName] || 0;
  }

  // Fallback to current incentive percentages
  return employee.incentivePercentages[packageName] || 0;
}

/**
 * Instance method:
 * Get applicable incentive percentage for a package on a given date
 */
EmployeeSchema.methods.getIncentivePercentageForDate = function (
  this: IEmployee,
  packageName: string,
  date: Date
): number {
  return getApplicableIncentivePercentage(this, packageName, date);
};

/**
 * Instance method:
 * Register a merchant as onboarded for this employee for the given year/month (defaults to now)
 * - Avoid duplicates (checks merchantID)
 * - Increments onboardedCount and updates totals
 * - Uses dynamic incentive percentage based on date
 * - Does NOT auto-calc bonus unless you call computeAndPersistMonthlyBonus
 */
EmployeeSchema.methods.registerOnboardedMerchant = async function (
  this: IEmployee,
  merchant: IOnboardedMerchant,
  year?: number,
  month?: number
) {
  const now = new Date();
  const y = year || now.getFullYear();
  const m = month || now.getMonth() + 1;

  // find or create monthly record
  let recIndex = this.monthlyRecords.findIndex(r => r.year === y && r.month === m);
  if (recIndex < 0) {
    this.monthlyRecords.push({
      year: y,
      month: m,
      revenueTarget: this.defaultMonthlyRevenueTarget,
      onboardedCount: 0,
      onboardedMerchants: [],
      bonusRule: null,
      bonusAmount: 0,
    } as IMonthlyOnboardRecord);
    recIndex = this.monthlyRecords.length - 1;
  }

  const rec = this.monthlyRecords[recIndex];

  // avoid duplicates
  const already = (rec.onboardedMerchants || []).some(m => m.merchantID === merchant.merchantID);
  if (!already) {
    // set revenue to package price
    merchant.revenue = this.packagePrices[merchant.package] || 0;
    rec.onboardedMerchants.push(merchant);
    rec.onboardedCount = rec.onboardedMerchants.length;
    this.totalOnboarded = (this.totalOnboarded || 0) + 1;

    // calculate onboarding incentive using dynamic percentage for the current date
    const incentivePercent = getApplicableIncentivePercentage(this, merchant.package, now);
    const incentive = merchant.revenue * incentivePercent / 100;
    this.onboardingIncentiveEarned = (this.onboardingIncentiveEarned || 0) + incentive;

    await this.save();
  }
};

/**
 * Instance method:
 * Compute & persist bonus for the given month (uses monthly override if present else employee default)
 * Returns computed bonus amount.
 */
EmployeeSchema.methods.computeAndPersistMonthlyBonus = async function (this: IEmployee, year: number, month: number) {
  const recIndex = this.monthlyRecords.findIndex(r => r.year === year && r.month === month);
  if (recIndex < 0) throw new Error("Monthly record not found");

  const rec = this.monthlyRecords[recIndex];
  const rule = rec.bonusRule || this.defaultBonusRule;
  const target = typeof rec.revenueTarget === "number" ? rec.revenueTarget : this.defaultMonthlyRevenueTarget;
  const totalRevenue = (rec.onboardedMerchants || []).reduce((sum, m) => sum + (m.revenue || 0), 0);

  const bonus = computeBonusFromRule(rule, target, totalRevenue);

  rec.bonusAmount = bonus;
  rec.bonusCalculatedAt = new Date();

  this.totalBonusEarned = (this.totalBonusEarned || 0) + bonus;

  await this.save();

  return bonus;
};

export default mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);
