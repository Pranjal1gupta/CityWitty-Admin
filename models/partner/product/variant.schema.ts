import { Schema } from "mongoose";

export const VariantSchema = new Schema(
    {
        variantId: { type: String,  },
        name: { type: String, },
        price: { type: Number,  },
        stock: { type: Number,  },
    },
    { _id: false }
);
