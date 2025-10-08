import { Document } from "mongoose";
import { IProduct } from "./product/product.interface";
import { IPartnerRating } from "./partnerRating.interface";

export interface IPartner extends Document {
    merchantId: string;
    username?: string;
    legalName: string;
    displayName: string;
    merchantSlug?: string;
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
        x?: string;
        youtube?: string;
        instagram?: string;
        facebook?: string;
    };
    agreeToTerms: boolean;

    products: IProduct[];
    logo?: string;
    storeImages?: string[];
    customOffer?: string;
    ribbonTag?: string;
    mapLocation?: string;
    visibility: boolean;
    joinedSince: Date;
    citywittyAssured: boolean;
    isVerified?: boolean;
    isCWassured?: boolean;
    isPremiumSeller?: boolean;
    isTopMerchant?: boolean;
    ratings?: IPartnerRating[];
    averageRating?: number;
    tags?: string[];
    status: "pending" | "active" | "suspended" | "inactive";

    suspensionReason?: string; // <-- new field added
    purchasedPackage?: {
        variantName: string;
        purchaseDate: Date;
        expiryDate: Date;
        transactionId: string;
    };

    renewal?: {
        isRenewed: boolean;
        renewalDate?: Date;
        renewalExpiry?: Date;
    };

    onboardingAgent?: {
        agentId: string;
        agentName: string;
    };
    otpCode?: string;
    otpExpiry?: Date;
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

    ds_graphics?: {
        graphicId: string;
        requestDate: Date;
        completionDate?: Date;
        status: string;
        requestCategory: string;
        content: string;
        subject: string;
        isSchedules?: boolean;
    }[];

    ds_reel?: {
        reelId: string;
        requestDate: Date;
        completionDate?: Date;
        status: string;
        content: string;
        subject: string;
    }[];

    ds_weblog?: {
        weblog_id: string;
        status: string;
        completionDate?: Date;
        description: string;
    }[];

    totalPodcast?: number;
    completedPodcast?: number;
    podcastLog?: {
        title: string;
        status: string;
        scheduleDate: Date;
        completeDate?: Date;
    }[];

    minimumOrderValue?: number;
    offlineDiscount?: {
        category: string;
        offerTitle: string;
        offerDescription: string;
        discountValue: number;
        discountPercent: number;
        status: "Active" | "Inactive";
        validUpto: Date;
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
}
