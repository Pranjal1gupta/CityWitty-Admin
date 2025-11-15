// models/Employee.ts
import mongoose, { Schema, Document } from "mongoose";

export type BonusCalcType = "perMerchant" | "fixed";

export interface IBonusRule {
  type: BonusCalcType;
  // used when type === 'perMerchant'
  amountPerMerchant?: number; // currency units per extra merchant
  // used when type === 'fixed'
  fixedBonusAmount?: number; // fixed bonus when target exceeded
}

export interface IMonthlyOnboardRecord {
  year: number;
  month: number; // 1-12
  target: number; // fixed target (number of merchants) for the month
  onboardedCount: number; // number of merchants actually onboarded this month
  partners: string[]; // optional list of merchantIds counted
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
  status?: "active" | "on_leave" | "suspended" | "terminated";
  defaultMonthlyTarget: number; // default target if not set in monthly record
  defaultBonusRule: IBonusRule;

  monthlyRecords: IMonthlyOnboardRecord[];  

  // convenience totals
  totalOnboarded?: number;
  totalBonusEarned?: number;

  // helper methods
  registerOnboardedPartner(partnerId: string, year?: number, month?: number): Promise<void>;
  computeAndPersistMonthlyBonus(year: number, month: number): Promise<number>;
}

const BonusRuleSchema = new Schema(
  {
    type: { type: String, enum: ["perMerchant", "fixed"], required: true },
    amountPerMerchant: { type: Number, min: 0 }, // used when perMerchant
    fixedBonusAmount: { type: Number, min: 0 }, // used when fixed
  },
  { _id: false }
);

const MonthlyOnboardSchema = new Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    target: { type: Number, required: true, default: 0 },
    onboardedCount: { type: Number, required: true, default: 0 },
    partners: [{ type: String }],
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

    status: { type: String, enum: ["active", "on_leave", "suspended", "terminated"], default: "active" },

    // default month target and bonus rule (applies when monthly record doesn't override)
    defaultMonthlyTarget: { type: Number, required: true, default: 10 }, // example default
    defaultBonusRule: { type: BonusRuleSchema, required: true, default: { type: "perMerchant", amountPerMerchant: 500 } },

    monthlyRecords: { type: [MonthlyOnboardSchema], default: [] },

    totalOnboarded: { type: Number, default: 0 },
    totalBonusEarned: { type: Number, default: 0 },
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
 * Helper: compute bonus for given rule, target and onboardedCount
 */
function computeBonusFromRule(rule: IBonusRule | null | undefined, target: number, onboardedCount: number): number {
  if (!rule) return 0;
  const excess = Math.max(0, onboardedCount - target);
  if (excess <= 0) return 0;

  if (rule.type === "perMerchant") {
    const amt = rule.amountPerMerchant || 0;
    return excess * amt;
  }

  // fixed
  if (rule.type === "fixed") {
    return rule.fixedBonusAmount || 0;
  }

  return 0;
}

/**
 * Instance method:
 * Register a partner as onboarded for this employee for the given year/month (defaults to now)
 * - Avoid duplicates (checks partners array)
 * - Increments onboardedCount and updates totals
 * - Does NOT auto-calc bonus unless you call computeAndPersistMonthlyBonus
 */
EmployeeSchema.methods.registerOnboardedPartner = async function (
  this: IEmployee,
  partnerId: string,
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
      target: this.defaultMonthlyTarget,
      onboardedCount: 0,
      partners: [],
      bonusRule: null,
      bonusAmount: 0,
    } as IMonthlyOnboardRecord);
    recIndex = this.monthlyRecords.length - 1;
  }

  const rec = this.monthlyRecords[recIndex];

  // avoid duplicates
  const already = (rec.partners || []).includes(partnerId);
  if (!already) {
    rec.partners.push(partnerId);
    rec.onboardedCount = (rec.onboardedCount || 0) + 1;
    this.totalOnboarded = (this.totalOnboarded || 0) + 1;

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
  const target = typeof rec.target === "number" ? rec.target : this.defaultMonthlyTarget;
  const onboarded = rec.onboardedCount || 0;

  const bonus = computeBonusFromRule(rule, target, onboarded);

  rec.bonusAmount = bonus;
  rec.bonusCalculatedAt = new Date();

  this.totalBonusEarned = (this.totalBonusEarned || 0) + bonus;

  await this.save();

  return bonus;
};

export default mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);
