import { Schema } from "mongoose";
import { VariantSchema } from "./variant.schema";
import { ProductRatingSchema } from "./productRating.schema";
import { FAQSchema } from "./faq.schema";

export const ProductSchema = new Schema<any>(
    {
        // productId: { type: String, required: true, unique: true },
        productId: { type: String },
        productName: { type: String, },
        productImages: {
            type: [String],
            validate: {
                validator: (arr: string[]) => arr.length >= 1 && arr.length <= 5,
                message: "Product must have between 1 and 5 images",
            },
        },
        productDescription: { type: String, },
        productCategory: { type: String, },
        brand: { type: String },
        productHighlights: [{ type: String }],
        productVariants: { type: [VariantSchema], },
        originalPrice: { type: Number, },
        discountedPrice: { type: Number },
        offerApplicable: { type: String, },
        deliveryFee: { type: Number, default: 0 },
        orderHandlingFee: { type: Number, default: 0 },
        discountOfferedOnProduct: { type: Number, default: 0 },
        productHeight: { type: Number },
        productWidth: { type: Number },
        productWeight: { type: Number },
        productPackageWeight: { type: Number },
        productPackageHeight: { type: Number },
        productPackageWidth: { type: Number },
        whatsInsideTheBox: { type: [String], },
        isWarranty: { type: Boolean, },
        warrantyDescription: { type: String },
        rating: [ProductRatingSchema],
        deliverableLocations: { type: [String], },
        eta: { type: String, },
        faq: [FAQSchema],
        instore: { type: Boolean, default: false },
        cityWittyAssured: { type: Boolean, default: false },
        isWalletCompatible: { type: Boolean, default: false },
        cashbackPoints: { type: Number, default: 0 },
        isPriority: { type: Boolean, default: false },
        sponsored: { type: Boolean, default: false },
        bestsellerBadge: { type: Boolean, default: false },
        additionalInfo: { type: String },
        isReplacement: { type: Boolean, default: false },
        replacementDays: { type: Number, default: 0 },
        isAvailableStock: { type: Boolean, default: true },
        availableStocks: { type: Number, default: 0 },
    },
    { timestamps: true }
);
