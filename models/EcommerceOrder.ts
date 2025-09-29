import mongoose, { Schema, Document, model, models } from "mongoose";

// --------------------
// 1️⃣ Interface
// --------------------
export interface IEcommerceOrder extends Document {
    orderId: string;                  // 1
    orderDate: Date;                  // 2
    orderAmount: number;              // 3
    isRefundInitiated: boolean;       // 4
    invoiceDate?: Date;               // 5
    invoiceNumber?: string;           // 6
    invoiceLink?: string;             // 7

    seller: {                          // 8–9 + 38–39
        sellerId: string;
        sellerName: string;
        sellerContactNo?: string;
        sellerEmail?: string;
    };

    quantity: number;                  // 10

    shippingAddress: {                 // 11–17 + Geo
        streetAddress: string;
        landmark?: string;
        locality?: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        latitude?: number;
        longitude?: number;
        geoLocation?: {
            type: "Point";
            coordinates: [number, number]; // [longitude, latitude]
        };
    };

    user: {                             // 18–20 + email
        userId: string;
        userName: string;
        userMobileNo: string;
        userEmail?: string;
    };

    product: {                           // 21–23
        productId: string;
        productName: string;
        productVariant?: string;
    };

    orderStatus:
    | "pending"
    | "confirmed"
    | "shipped"
    | "out for delivery"
    | "delivered"
    | "cancelled"
    | "returned";                      // 24

    savingAmount?: number;               // 25
    deliveryFees: number;                // 26
    etd?: string;                        // 27
    deliveryDate?: Date;                 // 28

    isReturned: boolean;                 // 29
    returnValidity?: Date;               // 30
    returnDate?: Date;                   // 31
    pickupDate?: Date;                   // 32
    returnDeliveryDate?: Date;           // 33
    returnReason?: string;               // 34

    orderRating?: number;                // 35
    orderReview?: string;                // 36
    paidThrough: string;                 // 37

    concernFlags?: {                     // ⬅️ NEW: User tickets
        flagId: string;                  // unique id for each ticket
        issue: string;                   // short issue title
        description?: string;            // optional details
        status?: "open" | "resolved" | "closed";
        createdAt?: Date;
    }[];
}

// --------------------
// 2️⃣ Schema
// --------------------
const EcommerceOrderSchema = new Schema<IEcommerceOrder>(
    {
        orderId: { type: String, required: true, unique: true },
        orderDate: { type: Date, required: true, default: Date.now },
        orderAmount: { type: Number, required: true },
        invoiceDate: { type: Date },
        invoiceNumber: { type: String },
        invoiceLink: { type: String },

        seller: {
            sellerId: { type: String, required: true },
            sellerName: { type: String, required: true },
            sellerContactNo: { type: String },
            sellerEmail: { type: String },
        },

        quantity: { type: Number, required: true, min: 1 },

        shippingAddress: {
            streetAddress: { type: String, required: true },
            landmark: { type: String },
            locality: { type: String },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            country: { type: String, required: true, default: "India" },
            latitude: { type: Number },
            longitude: { type: Number },
            geoLocation: {
                type: {
                    type: String,
                    enum: ["Point"],
                    default: "Point",
                },
                coordinates: {
                    type: [Number], // [longitude, latitude]
                    validate: {
                        validator: function (v: number[]) {
                            return v.length === 2;
                        },
                        message: "Geo coordinates must be [longitude, latitude]",
                    },
                },
            },
        },

        user: {
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            userMobileNo: { type: String, required: true },
            userEmail: { type: String },
        },

        product: {
            productId: { type: String, required: true },
            productName: { type: String, required: true },
            productVariant: { type: String },
        },

        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "shipped",
                "out for delivery",
                "delivered",
                "cancelled",
                "returned",
            ],
            default: "pending",
        },

        savingAmount: { type: Number, default: 0 },
        deliveryFees: { type: Number, required: true, default: 0 },
        etd: { type: String },
        deliveryDate: { type: Date },

        isRefundInitiated: { type: Boolean, default: false },
        isReturned: { type: Boolean, default: false },
        returnValidity: { type: Date },
        returnDate: { type: Date },
        pickupDate: { type: Date },
        returnDeliveryDate: { type: Date },
        returnReason: { type: String },

        orderRating: { type: Number, min: 1, max: 5 },
        orderReview: { type: String },
        paidThrough: { type: String, required: true },

        concernFlags: [
            {
                flagId: { type: String, required: true },
                issue: { type: String, required: true },
                description: { type: String },
                status: {
                    type: String,
                    enum: ["open", "resolved", "closed"],
                    default: "open",
                },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

// Indexes for performance & geospatial queries
EcommerceOrderSchema.index({ orderId: 1 });
EcommerceOrderSchema.index({ "user.userId": 1 });
EcommerceOrderSchema.index({ "seller.sellerId": 1 });
EcommerceOrderSchema.index({ orderStatus: 1 });
EcommerceOrderSchema.index({ "shippingAddress.geoLocation": "2dsphere" }); // Geo queries

export default models.EcommerceOrder ||
    model<IEcommerceOrder>("EcommerceOrder", EcommerceOrderSchema);
