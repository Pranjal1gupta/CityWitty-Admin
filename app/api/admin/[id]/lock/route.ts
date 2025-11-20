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
    const { lock } = await request.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid admin ID" },
        { status: 400 }
      );
    }

    if (typeof lock !== "boolean") {
      return NextResponse.json(
        { error: "Invalid data. lock must be boolean" },
        { status: 400 }
      );
    }

    const updateData = lock
      ? { accountLockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) } // lock for 24 hours
      : { accountLockedUntil: null, accountLockReason: "" };

    const admin = await Admin.findByIdAndUpdate(
      id,
      updateData,
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
        message: `Admin account ${lock ? "locked" : "unlocked"} successfully`,
        admin: {
          _id: (admin._id as Types.ObjectId).toString(),
          username: admin.username,
          email: admin.email,
          role: admin.role || "admin",
          status: admin.status || "active",
          accountLockedUntil: admin.accountLockedUntil ? new Date(admin.accountLockedUntil).toISOString() : null,
          createdAt: admin.createdAt ? new Date(admin.createdAt).toISOString() : null,
          lastLogin: admin.lastLogin ? new Date(admin.lastLogin).toISOString() : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating admin account lock:", error);
    return NextResponse.json(
      { error: "Failed to update admin account lock" },
      { status: 500 }
    );
  }
}