// export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "@/models/Admin";
import { sendFailedLoginWarningEmail } from "@/lib/send-warning-email";

const getClientIP = (req: Request): string => {
  const headers = req.headers;
  
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;
  
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;
  
  const xClientIp = headers.get('x-client-ip');
  if (xClientIp) return xClientIp;
  
  return 'Unknown';
};

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

export async function POST(req: Request) {
  try {
    console.log("Login attempt started");

    const { email, password } = await req.json();
    console.log("Received email:", email);

    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");

    console.log("Searching for admin with email:", email.toLowerCase());
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    console.log("Admin found:", !!admin);

    if (!admin) {
      console.log("No admin found with that email");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (admin.status === "inactive") {
      console.log("Admin account is inactive");
      return NextResponse.json({
        error: "Account inactive",
        reason: admin.accountLockReason || "Your account has been deactivated",
        inactiveUntil: admin.accountLockedUntil,
        isInactive: true
      }, { status: 403 });
    }

    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Password does not match");
      const failedAttempts = (admin.failedLoginAttempts || 0) + 1;
      console.log("Incrementing failed login attempts to:", failedAttempts);
      
      await Admin.findByIdAndUpdate(
        admin._id,
        {
          failedLoginAttempts: failedAttempts
        },
        { new: true }
      );

      if (failedAttempts > 5) {
        console.log("Failed attempts exceeded 5, sending warning email");
        await sendFailedLoginWarningEmail(admin.email, admin.username, failedAttempts);
      }
      
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("Updating last login...");
    
    const ip = getClientIP(req);
    console.log("Client IP:", ip);
    
    await Admin.findByIdAndUpdate(
      admin._id,
      {
        lastLogin: new Date(),
        lastLoginIP: ip
      },
      { new: true }
    );
    console.log("Last login updated successfully");

    console.log("Login successful, returning response");
    return NextResponse.json({
      success: true,
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role || "admin",
      isSuperAdmin: admin.isSuperAdmin || false,
      avatar: admin.avatar || null,
    });
  } catch (err) {
    console.error("Login error details:", err);
    const error = err as Error;
    console.error("Error stack:", error?.stack);
    return NextResponse.json({
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
}
