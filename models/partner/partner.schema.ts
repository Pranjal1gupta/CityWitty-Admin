import { Schema, model, models } from "mongoose";
import { ProductSchema } from "@/models/partner/product/product.schema";
import { DsGraphicSchema } from "@/models/partner/ds_graphic.schema";
import { DsReelSchema } from "@/models/partner/ds_reel.schema";
import { DsWeblogSchema } from "@/models/partner/ds_weblog.schema";
import { PodcastLogSchema } from "@/models/partner/podcastLog.schema";
import { OfflineDiscountSchema } from "@/models/partner/offlineDiscount.schema";
import { BranchLocationSchema } from "@/models/partner/branchLocation.schema";
import { IPartner } from "@/models/partner/partner.interface";

export const PartnerSchema = new Schema<IPartner>(
    {
        merchantId: { type: String, required: true, unique: true },
        legalName: { type: String, required: true },
        displayName: { type: String, required: true },
        email: { type: String, required: true },
        emailVerified: { type: Boolean, default: false },
        phone: { type: String, required: true },
        phoneVerified: { type: Boolean, default: false },
        password: { type: String, required: true, minlength: 6 },
        category: { type: String, required: true },
        city: { type: String, required: true },
        streetAddress: { type: String, required: true },
        pincode: { type: String },
        locality: { type: String },
        state: { type: String },
        country: { type: String, default: "India" },
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
        businessHours: {
            open: { type: String },
            close: { type: String },
            days: { type: [String], default: [] },
        },
        agreeToTerms: { type: Boolean, required: true },

        products: [ProductSchema],
        ds_graphics: [DsGraphicSchema],
        ds_reel: [DsReelSchema],
        ds_weblog: [DsWeblogSchema],
        podcastLog: [PodcastLogSchema],
        offlineDiscount: [OfflineDiscountSchema],
        branchLocations: [BranchLocationSchema],

        visibility: { type: Boolean, default: false },
        joinedSince: { type: Date, default: Date.now },
        citywittyAssured: { type: Boolean, default: false },

        ratings: [
            {
                userId: { type: String },
                user: { type: String },
                rating: { type: Number, min: 1, max: 5 },
                review: { type: String },
                reply: { type: String },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        averageRating: { type: Number, default: 0 },
        tags: { type: [String], default: [] },
        status: {
            type: String,
            enum: ["pending", "active", "suspended", "inactive"],
            default: "pending",
        },
        suspensionReason: { type: String }, // <-- new field added

        purchasedPackage: {
            variantName: { type: String },
            purchaseDate: { type: Date },
            expiryDate: { type: Date },
            transactionId: { type: String },
        },

        renewal: {
            isRenewed: { type: Boolean, default: false },
            renewalDate: { type: Date },
            renewalExpiry: { type: Date },
        },

        onboardingAgent: {
            agentId: { type: String },
            agentName: { type: String },
        },

        otpCode: { type: String },
        otpExpiry: { type: Date },

        paymentMethodAccepted: { type: [String], default: [] },
        qrcodeLink: { type: String },

        ListingLimit: { type: Number, default: 0 },
        Addedlistings: { type: Number, default: 0 },
        totalGraphics: { type: Number, default: 0 },
        totalReels: { type: Number, default: 0 },
        isWebsite: { type: Boolean, default: false },
        totalEarnings: { type: Number, default: 0 },
        minimumOrderValue: { type: Number, default: 149 },
    },
    { timestamps: true }
);

// Auto-calc average rating
PartnerSchema.pre("save", function (next) {
    if (Array.isArray(this.ratings) && this.ratings.length > 0) {
        const total = this.ratings.reduce((sum, r) => sum + r.rating, 0);
        this.averageRating = total / this.ratings.length;
    } else {
        this.averageRating = 0;
    }
    next();
});

export default models.Partner || model<IPartner>("Partner", PartnerSchema);
