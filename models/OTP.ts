import mongoose, { Schema, Document, Model } from "mongoose";

interface IOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const OTPSchema: Schema<IOTP> = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for automatic expiration
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for email lookup
OTPSchema.index({ email: 1 });

// 👇 Cast mongoose.models.OTP to match the type
const OTP =
  (mongoose.models.OTP as Model<IOTP>) ||
  mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;