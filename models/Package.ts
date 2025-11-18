// models/Package.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPackage extends Document {
  name: string;
  price: number;
  incentivePercent: number;
  ListingLimit: number;
  totalGraphics: number;
  totalReels: number;
  totalPodcast: number;
}

const PackageSchema = new Schema<IPackage>(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    incentivePercent: { type: Number, required: true, min: 0, max: 100 },
    ListingLimit: { type: Number, required: true, min: 0 },
    totalGraphics: { type: Number, required: true, min: 0 },
    totalReels: { type: Number, required: true, min: 0 },
    totalPodcast: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Package || mongoose.model<IPackage>("Package", PackageSchema);