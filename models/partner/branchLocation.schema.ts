import { Schema } from "mongoose";

export const BranchLocationSchema = new Schema(
    {
        branchName: { type: String, required: true },
        city: { type: String, required: true },
        streetAddress: { type: String, required: true },
        pincode: { type: String },
        locality: { type: String },
        state: { type: String },
        country: { type: String, default: "India" },
        mapLocation: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
    },
    { _id: false }
);
