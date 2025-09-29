import mongoose, { Schema, Document, model, models } from "mongoose";

// ---------------- Address Sub-Schema ----------------
const AddressSchema = new Schema(
  {
    addressName: { type: String, required: true },
    streetAddress: { type: String, required: true },
    landmark: { type: String },
    locality: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    latitude: { type: Number },
    longitude: { type: Number },
    geoLocation: { type: String }, // e.g. Google Maps link
  },
  { _id: false }
);

// ---------------- Referred User Sub-Schema ----------------
const ReferredUserSchema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

// ---------------- User Interface ----------------
export interface IUser extends Document {
  userId: string;
  name: string;
  email: string;
  password: string;
  provider: "credentials" | "google";
  isCardExist: boolean;
  cardVarientName?: string;
  cardNumber?: string;
  purchasedDate?: Date;
  expiryDate?: Date;
  isRenewed?: boolean;
  renewedOn?: Date | null;
  validUpto?: Date | null;
  cardStatus: "active" | "expired" | "blocked" | "pending";
  deactivationReason?: string;
  mobile?: string;
  whatsapp?: string;
  myAddresses?: {
    addressName: string;
    streetAddress: string;
    landmark?: string;
    locality?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    geoLocation?: string;
  }[];
  profilePicture?: string;
  dateOfBirth?: Date;
  lastLogin?: Date;
  myReferral?: string;
  referredUsers?: { userId: string; name: string }[];
  walletBalance?: number;
  totalPurchases?: number;
  totalSaving?: number;
  cart?: string[]; // product ids
  wishlist?: string[]; // product ids
  createdAt?: Date;
  updatedAt?: Date;
}

// ---------------- User Schema ----------------
const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },

    isCardExist: { type: Boolean, default: false },
    cardVarientName: { type: String },
    cardNumber: { type: String },
    purchasedDate: { type: Date },
    expiryDate: { type: Date },
    isRenewed: { type: Boolean, default: false },
    renewedOn: { type: Date, default: null },
    validUpto: { type: Date, default: null },
    cardStatus: {
      type: String,
      enum: ["active", "expired", "blocked", "pending"],
      default: "pending",
    },
    deactivationReason: { type: String },

    mobile: { type: String },
    whatsapp: { type: String },
    myAddresses: [AddressSchema],

    profilePicture: { type: String }, // cloudinary link
    dateOfBirth: { type: Date },
    lastLogin: { type: Date },

    myReferral: { type: String },
    referredUsers: [ReferredUserSchema],

    walletBalance: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    totalSaving: { type: Number, default: 0 },

    cart: [{ type: String }], // product ids
    wishlist: [{ type: String }], // product ids
  },
  { timestamps: true } // adds createdAt & updatedAt
);

export default models.User || model<IUser>("User", UserSchema);
