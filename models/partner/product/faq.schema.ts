import { Schema } from "mongoose";

export const FAQSchema = new Schema(
    {
        question: { type: String,  },
        answer: { type: String, },
        certifiedBuyer: { type: Boolean,  },
        isLike: { type: Boolean, default: false },
    },
    { _id: false }
);
