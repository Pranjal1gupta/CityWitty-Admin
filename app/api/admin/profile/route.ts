import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "@/models/Admin";
import User from "@/models/User";
import Partner from "@/models/partner/partner.schema";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

    await connectDB();

    const admin = await Admin.findById(id).select("-password");
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Calculate stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const merchantsApproved = await Partner.countDocuments({ status: "active" });
    const cardsActivated = await User.countDocuments({ cardStatus: "active" });
    const actionsThisMonth = await Partner.countDocuments({
      status: "active",
      updatedAt: { $gte: startOfMonth }
    }) + await User.countDocuments({
      cardStatus: "active",
      updatedAt: { $gte: startOfMonth }
    });
    const systemUptime = 99; // Placeholder, can be dynamic if needed

    const stats = {
      actionsThisMonth,
      merchantsApproved,
      cardsActivated,
      systemUptime
    };

    return NextResponse.json({
      success: true,
      admin: {
        ...admin.toObject(),
        stats
      }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, username, email, phone, address } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

    await connectDB();

    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      admin
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
