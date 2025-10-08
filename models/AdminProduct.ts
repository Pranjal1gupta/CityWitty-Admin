import mongoose, { Schema, Document, model, models } from "mongoose";

// ---------------- Variant Schema ----------------
const AdminVariantSchema = new Schema(
  {
    variantId: { type: String },
    name: { type: String },
    price: { type: Number },
    stock: { type: Number },
    isAvailableStock: { type: Boolean, default: true },
  },
  { _id: false }
);

// ---------------- Rating Schema ----------------
const AdminProductRatingSchema = new Schema(
  {
    userId: { type: String },
    userName: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    adminReply: { type: String },
    isLike: { type: Boolean, default: false },
    certifiedBuyer: { type: Boolean, default: true },
  },
  { _id: false, timestamps: true }
);

// ---------------- FAQ Schema ----------------
const AdminFAQSchema = new Schema(
  {
    question: { type: String },
    answer: { type: String },
    certifiedBuyer: { type: Boolean },
    isLike: { type: Boolean },
  },
  { _id: false }
);

// ---------------- AdminProduct Schema ----------------
export interface IAdminProduct extends Document {
  productId: string;
  productName: string;
  productImages: string[];
  productDescription: string;
  productCategory: string;
  brand?: string;

  productHighlights?: string[];
  productVariants: (typeof AdminVariantSchema)[];

  originalPrice: number;
  discountedPrice?: number;

  offerApplicable: string;

  deliveryFee?: number;
  orderHandlingFee?: number;
  discountOfferedOnProduct?: number;
  productHeight?: number;
  productWidth?: number;
  productWeight?: number;
  productPackageWeight?: number;
  productPackageHeight?: number;
  productPackageWidth?: number;

  whatsInsideTheBox: string[];
  isWarranty: boolean;
  warrantyDescription?: string;

  rating?: (typeof AdminProductRatingSchema)[];

  deliverableLocations: string[];
  eta: string;

  faq?: (typeof AdminFAQSchema)[];

  instore?: boolean;
  cityWittyAssured?: boolean;
  isWalletCompatible?: boolean;
  cashbackPoints?: number;
  isPriority?: boolean;
  sponsored?: boolean;

  bestsellerBadge?: boolean;
  additionalInfo?: string;

  isReplacement?: boolean;
  replacementDays?: number;

  // ⭐ NEW FIELDS
  isAvailableStock?: boolean;
  availableStocks?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

const AdminProductSchema = new Schema<IAdminProduct>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productImages: {
      type: [String],
      validate: [
        {
          validator: (arr: string[]) => arr.length <= 5,
          message: "Product can have at most 5 images",
        },
      ],
    },
    productDescription: { type: String, required: true },
    productCategory: { type: String, required: true },
    brand: { type: String },

    productHighlights: [{ type: String }],
    productVariants: { type: [AdminVariantSchema] },

    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number },

    offerApplicable: { type: String },

    deliveryFee: { type: Number, default: 10 },
    orderHandlingFee: { type: Number, default: 10 }, // ⭐ NEW FIELD
    discountOfferedOnProduct: { type: Number, default: 0 },
    productHeight: { type: Number, required: true },
    productWidth: { type: Number, required: true },
    productWeight: { type: Number, required: true },
    productPackageWeight: { type: Number, required: true },
    productPackageHeight: { type: Number, required: true },
    productPackageWidth: { type: Number, required: true },

    whatsInsideTheBox: { type: [String] },
    isWarranty: { type: Boolean, default: false },
    warrantyDescription: { type: String },

    rating: [AdminProductRatingSchema],

    deliverableLocations: { type: [String], required: true },
    eta: { type: String, required: true },

    faq: [AdminFAQSchema],

    instore: { type: Boolean, default: false },
    cityWittyAssured: { type: Boolean, default: true },
    isWalletCompatible: { type: Boolean, default: false },
    cashbackPoints: { type: Number, default: 0 },
    isPriority: { type: Boolean, default: false },
    sponsored: { type: Boolean, default: false },

    bestsellerBadge: { type: Boolean, default: false },
    additionalInfo: { type: String },

    isReplacement: { type: Boolean, default: false },
    replacementDays: { type: Number, default: 0 },

    // ⭐ NEW FIELDS
    isAvailableStock: { type: Boolean, default: true },
    availableStocks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.AdminProduct ||
  model<IAdminProduct>("AdminProduct", AdminProductSchema);
