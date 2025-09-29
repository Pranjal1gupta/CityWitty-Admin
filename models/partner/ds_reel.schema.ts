import { Schema } from "mongoose";

export const DsReelSchema = new Schema(
    {
        reelId: { type: String },
        requestDate: { type: Date },
        completionDate: { type: Date },
        status: { type: String, enum: ["completed", "pending"], default: "pending" },
        content: { type: String },
        subject: { type: String },
    },
    { _id: false }
);
