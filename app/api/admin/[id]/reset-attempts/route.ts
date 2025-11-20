import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { Types } from "mongoose";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid admin ID" },
        { status: 400 }
      );
    }

    const admin = await Admin.findByIdAndUpdate(
      id,
      { failedLoginAttempts: 0 },
      { new: true }
    ).select("-password").lean();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Admin failed login attempts reset successfully",
        admin: {
          _id: (admin._id as Types.ObjectId).toString(),
          username: admin.username,
          email: admin.email,
          role: admin.role || "admin",
          status: admin.status || "active",
          failedLoginAttempts: admin.failedLoginAttempts || 0,
          createdAt: admin.createdAt ? new Date(admin.createdAt).toISOString() : null,
          lastLogin: admin.lastLogin ? new Date(admin.lastLogin).toISOString() : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting admin failed login attempts:", error);
    return NextResponse.json(
      { error: "Failed to reset admin failed login attempts" },
      { status: 500 }
    );
  }
}