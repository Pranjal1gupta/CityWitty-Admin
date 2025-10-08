import { Schema } from "mongoose";

export const PartnerRatingSchema = new Schema(
    {
        userId: { type: String, required: true },
        user: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String },
        reply: { type: String },
        createdAt: { type: Date, default: Date.now }
    },
    { _id: false }
);