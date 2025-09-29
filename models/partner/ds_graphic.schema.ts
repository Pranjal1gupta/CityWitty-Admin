import { Schema } from "mongoose";

export const DsGraphicSchema = new Schema(
    {
        graphicId: { type: String },
        requestDate: { type: Date },
        completionDate: { type: Date },
        status: { type: String, enum: ["completed", "pending"], default: "pending" },
        requestCategory: { type: String },
        content: { type: String },
        subject: { type: String },
        isSchedules: { type: Boolean, default: false },
    },
    { _id: false }
);
