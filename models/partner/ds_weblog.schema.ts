import { Schema } from "mongoose";

export const DsWeblogSchema = new Schema(
    {
        weblog_id: { type: String },
        status: { type: String, enum: ["completed", "pending"], default: "pending" },
        completionDate: { type: Date },
        description: { type: String },
    },
    { _id: false }
);
