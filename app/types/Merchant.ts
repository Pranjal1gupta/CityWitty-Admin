export interface Product {
  productId: string;
  productName: string;
  productImages?: string[];
  productDescription: string;
  productCategory: string;
  brand?: string;
  productHighlights?: string[];
  productVariants?: {
    variantId: string;
    name: string;
    price: number;
    stock: number;
  }[];
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
  rating?: any[];
  deliverableLocations: string[];
  eta: string;
  faq?: any[];
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
  isAvailableStock?: boolean;
  availableStocks?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Rating {
  user: string;
  rating: number;
  review?: string;
  reply?: string;
  createdAt?: string;
}

export interface Merchant {
  _id: string;
  merchantId: string;
  legalName: string;
  displayName: string;
  email: string;
  emailVerified?: boolean;
  phone: string;
  phoneVerified?: boolean;
  password: string;
  category: string;
  city: string;
  streetAddress: string;
  pincode?: string;
  locality?: string;
  state?: string;
  country?: string;
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
  products: Product[];
  logo?: string;
  storeImages?: string[];
  customOffer?: string;
  ribbonTag?: string;
  mapLocation?: string;
  visibility: boolean;
  joinedSince: string;
  citywittyAssured: boolean;
  ratings: Rating[];
  averageRating?: number;
  tags?: string[];
  status: "pending" | "active" | "suspended" | "inactive";
  suspensionReason?: string;
  purchasedPackage?: {
    variantName: string;
    purchaseDate: string;
    expiryDate: string;
    transactionId: string;
  };
  renewal?: {
    isRenewed: boolean;
    renewalDate?: string;
    renewalExpiry?: string;
  };
  onboardingAgent?: {
    agentId: string;
    agentName: string;
  };
  otpCode?: string;
  otpExpiry?: string;
  paymentMethodAccepted?: string[];
  qrcodeLink?: string;
  businessHours?: {
    open?: string;
    close?: string;
    days?: string[];
  };
  bankDetails?: {
    bankName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branchName?: string;
    upiId?: string;
  };
  ListingLimit?: number;
  Addedlistings?: number;
  totalGraphics?: number;
  totalReels?: number;
  isWebsite?: boolean;
  totalEarnings?: number;
  minimumOrderValue?: number;
  offlineDiscount?: {
    category: string;
    offerTitle: string;
    offerDescription: string;
    discountValue: number;
    discountPercent: number;
    status: "Active" | "Inactive";
    validUpto: string;
  }[];
  branchLocations?: {
    branchName: string;
    city: string;
    streetAddress: string;
    pincode?: string;
    locality?: string;
    state?: string;
    country?: string;
    mapLocation?: string;
    latitude?: number;
    longitude?: number;
  }[];
  ds_graphics?: {
    graphicId: string;
    requestDate: string;
    completionDate?: string;
    status: string;
    requestCategory: string;
    content: string;
    subject: string;
    isSchedules?: boolean;
  }[];
  ds_reel?: {
    reelId: string;
    requestDate: string;
    completionDate?: string;
    status: string;
    content: string;
    subject: string;
  }[];
  ds_weblog?: {
    weblog_id: string;
    status: string;
    completionDate?: string;
    description: string;
  }[];
  totalPodcast?: number;
  completedPodcast?: number;
  podcastLog?: {
    title: string;
    status: string;
    scheduleDate: string;
    completeDate?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  totalMerchants: number;
  activeMerchants: number;
  pendingApprovals: number;
  suspendedMerchants: number;
}

export type ModalType = "view" | "approve" | "activate" | "deactivate" | "toggleVisibility" | "adjustLimits" | null;
