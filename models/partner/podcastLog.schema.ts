import { Schema } from "mongoose";

export const PodcastLogSchema = new Schema(
    {
        title: { type: String },
        scheduleDate: { type: Date },
        completeDate: { type: Date },
        status: { type: String, enum: ["scheduled", "completed", "pending"], default: "pending" },
    },
    { _id: false }
);
