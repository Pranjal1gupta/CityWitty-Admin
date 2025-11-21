import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Admin from "@/models/Admin";

const connectDB = async () => {
  try {
    if (mongoose.connections.length > 0 && mongoose.connections[0].readyState === 1) return;
    await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "citywitty",
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw new Error("Failed to connect to MongoDB");
  }
};

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, permissions } = body;

    if (!userId || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    await connectDB();

    const superAdmin = await Admin.findById(userId);
    if (!superAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    if (!superAdmin.isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: "Only Super Admins can update permissions" },
        { status: 403 }
      );
    }

    const result = await Admin.updateMany(
      { role: "admin", isSuperAdmin: false },
      { permissions }
    );

    await Admin.updateMany(
      { isSuperAdmin: true },
      { permissions }
    );

    return NextResponse.json(
      {
        success: true,
        message: `Permissions updated for ${result.modifiedCount} admins and all superadmins`,
        permissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating permissions:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const admin = await Admin.findById(userId).select("permissions");

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, permissions: admin.permissions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
