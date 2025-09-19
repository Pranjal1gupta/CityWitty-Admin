// export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "@/models/Admin";

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) return;

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

    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Password does not match");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("Updating last login...");
    admin.lastLogin = new Date();
    await admin.save();
    console.log("Last login updated successfully");

    console.log("Login successful, returning response");
    return NextResponse.json({
      success: true,
      id: admin._id,
      username: admin.username,
      email: admin.email,
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
