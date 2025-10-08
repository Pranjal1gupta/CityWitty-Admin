import { Schema } from "mongoose";

export const ProductRatingSchema = new Schema(
    {
        userId: { type: String,  },
        userName: { type: String,  },
        rating: { type: Number,  min: 1, max: 5 },
        review: { type: String,  },
        merchantReply: { type: String },
        isLike: { type: Boolean, default: false },
        certifiedBuyer: { type: Boolean, default: true },
    },
    { _id: false, timestamps: true }
);
