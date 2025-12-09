// models/franchise.model.ts
import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

// --- Types / Enums ---
export type FranchiseStatus = "pending" | "verification" | "approved" | "rejected";
export type BusinessType = "sole-proprietor" | "partnership" | "pvt-ltd" | "llp" | "other";

export interface IAddress {
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface IRegion {
  state: string;
  city: string;
  regionName: string;
  pinCodesCovered?: string[];
}

export interface IBankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  IFSCCode: string;
  branchName?: string;
}

export interface IDocuments {
  aadhaarDocument?: string;
  panDocument: string;
  photoUrl?: string;
  signatureUrl?: string;
}

export interface IFranchise extends Document {
  franchiseId: string;

  // Primary Owner
  fullName: string;
  email: string;
  emailVerified?: boolean;
  phone: string;
  phoneVerified?: boolean;
  whatsappNumber?: string;
  isWhatsappSame?: boolean;
  alternatePhone?: string;
  password: string;
  dateOfBirth?: Date;
  gender?: string;

  // Address
  address: IAddress;

  // Business / Company Info
  businessName?: string;
  businessType?: BusinessType;
  GSTNumber?: string;
  CINNumber?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessStatus?: "new" | "existing"; // NEW FIELD
  businessExperienceYears?: number;     // NEW FIELD
  existingBusinessCategory?: string;    // NEW FIELD
  existingBusinessDescription?: string; // NEW FIELD

  // Region
  region: IRegion;
  preferredStartDate?: Date;

  // Documents
  documents: IDocuments;

  // Bank
  bankDetails: IBankDetails;

  // Finance & Agreement
  franchisePlan?: string;
  interestDescription?: string;
  investmentAmount?: number;
  paymentMode?: string;
  transactionId?: string;
  agreementAccepted: boolean;

  // System fields
  status: FranchiseStatus;
  registrationDate: Date;

  createdAt: Date;
  updatedAt: Date;

  comparePassword?: (candidate: string) => Promise<boolean>;
}

// --- Sub-schemas ---
const AddressSchema = new Schema<IAddress>({
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pinCode: { type: String, trim: true },
});

const RegionSchema = new Schema<IRegion>({
  state: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  regionName: { type: String, required: true, trim: true },
  pinCodesCovered: { type: [String], default: [] },
});

const BankDetailsSchema = new Schema<IBankDetails>({
  accountHolderName: { type: String, required: true, trim: true },
  bankName: { type: String, required: true, trim: true },
  accountNumber: { type: String, required: true, trim: true },
  IFSCCode: { type: String, required: true, trim: true },
  branchName: { type: String, trim: true },
});

const DocumentsSchema = new Schema<IDocuments>({
  aadhaarDocument: { type: String, trim: true },
  panDocument: { type: String, required: true, trim: true },
  photoUrl: { type: String, trim: true },
  signatureUrl: { type: String, trim: true },
});

// --- Franchise schema ---
const FranchiseSchema = new Schema<IFranchise>(
  {
    franchiseId: { type: String, unique: true, index: true },

    // Primary Owner
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    emailVerified: { type: Boolean, default: false },
    phone: { type: String, required: true, trim: true, unique: true, index: true },
    phoneVerified: { type: Boolean, default: false },
    whatsappNumber: { type: String, trim: true },
    isWhatsappSame: { type: Boolean, default: false },
    alternatePhone: { type: String, trim: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String },
    interestDescription: { type: String, trim: true },

    // Address
    address: { type: AddressSchema },

    // Business Info
    businessName: { type: String, trim: true },
    businessType: {
      type: String,
      enum: ["sole-proprietor", "partnership", "pvt-ltd", "llp", "other"],
    },
    GSTNumber: { type: String, trim: true },
    CINNumber: { type: String, trim: true },
    businessEmail: { type: String, trim: true },
    businessPhone: { type: String, trim: true },

    // NEW BUSINESS DETAILS
    businessStatus: { type: String, enum: ["new", "existing"] },
    businessExperienceYears: { type: Number },
    existingBusinessCategory: { type: String, trim: true },
    existingBusinessDescription: { type: String, trim: true },

    // Region
    region: { type: RegionSchema, required: true },
    preferredStartDate: { type: Date },

    // Documents
    documents: { type: DocumentsSchema, required: true },

    // Bank
    bankDetails: { type: BankDetailsSchema, required: true },

    // Finance & Agreement
    franchisePlan: { type: String, trim: true },
    investmentAmount: { type: Number, default: 0 },
    paymentMode: { type: String, trim: true },
    transactionId: { type: String, trim: true },
    agreementAccepted: { type: Boolean, default: false },

    // System
    status: {
      type: String,
      enum: ["pending", "verification", "approved", "rejected"],
      default: "pending",
    },
    registrationDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index
FranchiseSchema.index({
  "region.state": 1,
  "region.city": 1,
  "region.regionName": 1,
});

FranchiseSchema.pre<IFranchise>("save", async function () {
  try {
    if (!this.franchiseId) {
      const randomSuffix = Math.random().toString(36).substr(2, 5).toUpperCase();
      this.franchiseId = `FR-${Date.now().toString().slice(-6)}-${randomSuffix}`;
    }
    if (this.isModified("password")) {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashed = await bcrypt.hash(this.password, salt);
      this.password = hashed;
    }
  } catch (err) {
    throw err;
  }
});

FranchiseSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const Franchise: Model<IFranchise> =
  mongoose.models.Franchise || mongoose.model<IFranchise>("Franchise", FranchiseSchema);

export default Franchise;
