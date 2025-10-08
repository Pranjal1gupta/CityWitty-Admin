import mongoose, { Schema, Document } from 'mongoose';
import { IPartner } from './partner.interface';
import { IProduct } from "./product/product.interface";
import { IPartnerRating } from "./partnerRating.interface";
import { PartnerRatingSchema } from './partnerRating.schema';
import { DsGraphicSchema } from './ds_graphic.schema';
import { DsReelSchema } from './ds_reel.schema';
import { DsWeblogSchema } from './ds_weblog.schema';
import { PodcastLogSchema } from './podcastLog.schema';
import { OfflineDiscountSchema } from './offlineDiscount.schema';
import { BranchLocationSchema } from './branchLocation.schema';


const PartnerSchema = new Schema<IPartner>({
  merchantId: { type: String, required: true, unique: true },
  username: { type: String },
  legalName: { type: String, required: true },
  displayName: { type: String, required: true },
  merchantSlug: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },
  phone: { type: String, required: true },
  phoneVerified: { type: Boolean },
  password: { type: String, required: true },
  category: { type: String, required: true },
  city: { type: String, required: true },
  streetAddress: { type: String, required: true },
  pincode: { type: String },
  locality: { type: String },
  state: { type: String },
  country: { type: String, default: "India" },
  whatsapp: { type: String, required: true },
  isWhatsappSame: { type: Boolean, required: true },
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
    x: { type: String },
    youtube: { type: String },
    instagram: { type: String },
    facebook: { type: String },
  },
  agreeToTerms: { type: Boolean, required: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  logo: { type: String },
  storeImages: [{ type: String }],
  customOffer: { type: String },
  ribbonTag: { type: String },
  mapLocation: { type: String },
  visibility: { type: Boolean, required: true },
  joinedSince: { type: Date, required: true, default: Date.now },
  citywittyAssured: { type: Boolean, required: true },
  isVerified: { type: Boolean },
  isCWassured: { type: Boolean },
  isPremiumSeller: { type: Boolean },
  isTopMerchant: { type: Boolean },
  ratings: [PartnerRatingSchema],
  averageRating: { type: Number },
  tags: [{ type: String }],
  status: { type: String, enum: ["pending", "active", "suspended", "inactive"], default: "pending" },
  suspensionReason: { type: String },
  purchasedPackage: {
    variantName: { type: String },
    purchaseDate: { type: Date },
    expiryDate: { type: Date },
    transactionId: { type: String }
  },
  renewal: {
    isRenewed: { type: Boolean },
    renewalDate: { type: Date },
    renewalExpiry: { type: Date }
  },
  onboardingAgent: {
    agentId: { type: String },
    agentName: { type: String }
  },
  otpCode: { type: String },
  otpExpiry: { type: Date },
  paymentMethodAccepted: [{ type: String }],
  qrcodeLink: { type: String },
  businessHours: {
    open: { type: String },
    close: { type: String },
    days: [{ type: String }]
  },
  bankDetails: {
    bankName: { type: String },
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    branchName: { type: String },
    upiId: { type: String }
  },
  ListingLimit: { type: Number },
  Addedlistings: { type: Number },
  totalGraphics: { type: Number },
  totalReels: { type: Number },
  isWebsite: { type: Boolean },
  totalEarnings: { type: Number },
  ds_graphics: [DsGraphicSchema],
  ds_reel: [DsReelSchema],
  ds_weblog: [DsWeblogSchema],
  totalPodcast: { type: Number },
  completedPodcast: { type: Number },
  podcastLog: [PodcastLogSchema],
  minimumOrderValue: { type: Number },
  offlineDiscount: [OfflineDiscountSchema],
  branchLocations: [BranchLocationSchema]
}, { timestamps: true }
);

export default mongoose.models.Partner || mongoose.model<IPartner>('Partner', PartnerSchema);