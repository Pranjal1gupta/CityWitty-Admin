import mongoose, { Schema, Document, Model } from "mongoose";

interface IAdmin extends Document {
  uniqueId: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role: "admin" | "superadmin";
  status: "active" | "inactive";
  avatar?: string;
  isSuperAdmin?: boolean;

  accountLockedUntil?: Date;
  accountLockReason?: string;

  // Security
  lastLogin?: Date;
  lastLoginIP?: string;
  failedLoginAttempts?: number;

  // Permissions
  permissions?: string[];

  // Audit
  createdBy?: string;
  updatedBy?: string;

  // Timestamps (added by mongoose timestamps: true)
  createdAt?: Date;
  updatedAt?: Date;

  meta?: Record<string, any>;
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    // Basic Info
    uniqueId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    avatar: { type: String, default: "" },

    // Role & Access
    role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
    isSuperAdmin: { type: Boolean, default: false },
    permissions: { type: [String], default: [] },

    // Account Status
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // Security Measures
    accountLockedUntil: { type: Date, default: undefined },
    accountLockReason: { type: String, default: "" },

    // Login Activity
    lastLogin: { type: Date, default: undefined },
    lastLoginIP: { type: String, default: "" },
    failedLoginAttempts: { type: Number, default: 0 },

    // Audit Fields
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },

    // Extra Metadata
    meta: { type: Object, default: {} },
  },
  { timestamps: true, strict: false }
);

// Cast mongoose.models.Admin
const Admin =
  (mongoose.models.Admin as Model<IAdmin>) ||
  mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
