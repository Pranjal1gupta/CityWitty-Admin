import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "@/models/Admin";
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
    const { email, otp, newPassword } = await req.json();

    console.log('Reset password request received:', {
      hasEmail: !!email,
      hasOtp: !!otp,
      hasNewPassword: !!newPassword,
      newPasswordLength: newPassword?.length
    });

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the most recent valid OTP for this email
    const storedOTP = await OTP.findOne({
      email: email.toLowerCase(),
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    console.log('Stored OTP found:', !!storedOTP, storedOTP ? { attempts: storedOTP.attempts, expiresAt: storedOTP.expiresAt } : null);

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
    console.log('OTP verification:', storedOTP.otp === otp ? 'matches' : 'does not match');
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

    // Find the admin user
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    console.log('Admin found:', !!admin);
    if (!admin) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password
    admin.password = hashedPassword;
    admin.lastLogin = new Date(); // Update last login to track password change
    await admin.save();

    // Clean up all OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    console.log(`Password reset successfully for ${email}`);

    return NextResponse.json({
      message: "Password reset successfully",
      success: true
    });
  } catch (err) {
    console.error("Reset password error:", err);
    const error = err as Error;
    return NextResponse.json({
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
}