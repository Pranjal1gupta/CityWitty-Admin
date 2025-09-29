import { Schema } from "mongoose";

export const OfflineDiscountSchema = new Schema(
    {
        category: { type: String, required: true },
        offerTitle: { type: String, required: true },
        offerDescription: { type: String, required: true },
        discountValue: { type: Number, required: true },
        discountPercent: { type: Number, required: true },
        status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
        validUpto: { type: Date, required: true },
    },
    { _id: false }
);
