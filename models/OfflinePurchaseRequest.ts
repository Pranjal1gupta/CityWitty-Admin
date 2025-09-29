import mongoose, { Schema, Document, model, models } from "mongoose";

// ---------------- Interface ----------------
export interface IOfflinePurchaseRequest extends Document {
    offlinePurchaseId: string;            // Unique ID for the offline purchase
    userId: string;                        // User making the purchase
    userName: string;                      // Name of the user
    merchantId: string;                    // Merchant/store reference
    date: Date;                             // Date of purchase
    actualPrice: number;                    // Original product price
    discount: number;                       // Discount applied
    finalPrice: number;                      // Price after discount
    status: "approved" | "rejected" | "expired" | "pending"; // Request status
    userMobileNo: string;                   // User’s mobile number
    productPurchased: string;               // Product name/details
    createdAt?: Date;                        // Auto from timestamps
    updatedAt?: Date;                        // Auto from timestamps
}

// ---------------- Schema ----------------
const OfflinePurchaseRequestSchema = new Schema<IOfflinePurchaseRequest>(
    {
        offlinePurchaseId: { type: String, required: true, unique: true },
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        merchantId: { type: String, required: true },
        date: { type: Date, required: true },
        actualPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        finalPrice: { type: Number, required: true },
        status: {
            type: String,
            enum: ["approved", "rejected", "expired", "pending"],
            default: "pending",
        },
        userMobileNo: { type: String, required: true },
        productPurchased: { type: String, required: true },
    },
    { timestamps: true } // adds createdAt & updatedAt automatically
);

// Prevent model overwrite in Next.js hot-reload
export default models.OfflinePurchaseRequest ||
    model<IOfflinePurchaseRequest>(
        "OfflinePurchaseRequest",
        OfflinePurchaseRequestSchema
    );
