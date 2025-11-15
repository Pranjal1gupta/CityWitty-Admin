 import { NextResponse } from "next/server";
import mongoose from "mongoose";
import OTP from "@/models/OTP";

const connectDB = async () => {
  try {
    if (mongoose.connections.length > 0 && mongoose.connections[0].readyState === 1) return;

    await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "citywitty",
    });

    console.log("✅ MongoDB connected with Mongoose");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw new Error("Failed to connect to MongoDB");
  }
};

const MAX_ATTEMPTS = 3;

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the most recent valid OTP for this email
    const storedOTP = await OTP.findOne({
      email: email.toLowerCase(),
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!storedOTP) {
      return NextResponse.json(
        { error: "OTP not found or expired" },
        { status: 400 }
      );
    }

    // Check attempts
    if (storedOTP.attempts >= MAX_ATTEMPTS) {
      // Clean up all OTPs for this email
      await OTP.deleteMany({ email: email.toLowerCase() });
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      // Increment attempts
      await OTP.updateOne(
        { _id: storedOTP._id },
        { $inc: { attempts: 1 } }
      );

      const remainingAttempts = MAX_ATTEMPTS - (storedOTP.attempts + 1);
      return NextResponse.json(
        {
          error: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
          attemptsRemaining: remainingAttempts
        },
        { status: 400 }
      );
    }

    // OTP is valid - do not delete yet, let reset-password handle it
    console.log(`OTP verified successfully for ${email}`);

    return NextResponse.json({
      message: "OTP verified successfully",
      success: true
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    const error = err as Error;
    return NextResponse.json({
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
}