// models/Partner.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IProduct {
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export interface IRating {
  user: string;
  rating: number;
  review?: string;
  reply?: string;
  createdAt?: Date;
}

export interface IPartner extends Document {
  applicationId: string;
  businessName: string;
  ownerName: string;
  email: string;
  emailVerified?: boolean;
  phone: string;
  phoneVerified?: boolean;
  password: string;
  category: string;
  city: string;
  address: string;
  whatsapp: string;
  isWhatsappSame: boolean;
  gstNumber: string;
  panNumber: string;
  businessType: string;
  yearsInBusiness: string;
  averageMonthlyRevenue: string;
  discountOffered: string;
  description: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
  };
  agreeToTerms: boolean;

  // 🔥 New Features
  products: IProduct[];
  logo?: string;
  storeImages?: string[];
  customOffer?: string;
  ribbonTag?: string;
  mapLocation?: string;
  visibility: boolean;
  joinedSince: Date;
  citywittyAssured: boolean;
  ratings: IRating[];
  averageRating?: number;
  tags?: string[];
  status: "pending" | "active" | "suspended";
  deactivationReason?: string;

  // 🔐 Password Reset Fields
  otpCode?: string;
  otpExpiry?: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
});

const RatingSchema = new Schema<IRating>({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
  reply: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const PartnerSchema = new Schema<IPartner>(
  {
    applicationId: { type: String, required: true, unique: true },
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    phone: { type: String, required: true },
    phoneVerified: { type: Boolean, default: false },
    password: { type: String, required: true, minlength: 6 },
    category: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    whatsapp: { type: String, required: true },
    isWhatsappSame: { type: Boolean, default: false },
    gstNumber: { type: String, required: true },
    panNumber: { type: String, required: true },
    businessType: { type: String, required: true },
    yearsInBusiness: { type: String, required: true },
    averageMonthlyRevenue: { type: String, required: true },
    discountOffered: { type: String, required: true },
    description: { type: String, required: true },
    website: { type: String },
    socialLinks: {
      linkedin: { type: String },
      twitter: { type: String },
      youtube: { type: String },
      instagram: { type: String },
      facebook: { type: String },
    },
    agreeToTerms: { type: Boolean, required: true },

    // 🔥 New Features
    products: [ProductSchema],
    logo: { type: String },
    storeImages: [{ type: String }],
    customOffer: { type: String },
    ribbonTag: { type: String },
    mapLocation: { type: String },
    visibility: { type: Boolean, default: false },
    joinedSince: { type: Date, default: Date.now },
    citywittyAssured: { type: Boolean, default: false },
    ratings: [RatingSchema],
    averageRating: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["pending", "active", "suspended"], default: "pending" },
    deactivationReason: { type: String },

    // 🔐 Password Reset
    otpCode: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

// Auto-calc average rating
PartnerSchema.pre("save", function (next) {
  if (this.ratings.length > 0) {
    const total = this.ratings.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = total / this.ratings.length;
  } else {
    this.averageRating = 0;
  }
  next();
});

export default models.Partner || model<IPartner>("Partner", PartnerSchema);