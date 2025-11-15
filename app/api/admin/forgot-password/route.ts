import { NextResponse } from "next/server";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Admin from "@/models/Admin";
import OTP from "@/models/OTP";
import { emailLogger } from "@/lib/email-logger";

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

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

const sendOTPEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "CityWitty Admin - Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password for your CityWitty Admin account.</p>
        <p>Your OTP (One-Time Password) is:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #333;">${otp}</span>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>CityWitty Admin Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check rate limiting
    const recentRequests = await OTP.countDocuments({
      email: email.toLowerCase(),
      createdAt: { $gte: new Date(Date.now() - RATE_LIMIT_WINDOW) }
    });

    if (recentRequests >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again later." },
        { status: 429 }
      );
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return NextResponse.json(
        { error: "This email is not registered as an admin" },
        { status: 400 }
      );
    }

    // Clean up expired OTPs for this email
    await OTP.deleteMany({
      email: email.toLowerCase(),
      expiresAt: { $lt: new Date() }
    });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      expiresAt,
    });

    // Send OTP email with logging
    try {
      emailLogger.log({
        email: email.toLowerCase(),
        type: 'otp',
        status: 'pending',
        metadata: { otpLength: otp.length }
      });

      await sendOTPEmail(email, otp);

      emailLogger.log({
        email: email.toLowerCase(),
        type: 'otp',
        status: 'sent',
        metadata: { otpLength: otp.length }
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);

      emailLogger.log({
        email: email.toLowerCase(),
        type: 'otp',
        status: 'failed',
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
        metadata: { otpLength: otp.length }
      });

      // Clean up the OTP if email failed
      await OTP.deleteMany({
        email: email.toLowerCase(),
        otp,
      });
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "OTP sent successfully",
      success: true
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    const error = err as Error;
    return NextResponse.json({
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
}