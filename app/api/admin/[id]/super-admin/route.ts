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
    const { isSuperAdmin, role } = await request.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid admin ID" },
        { status: 400 }
      );
    }

    if (typeof isSuperAdmin !== "boolean" || !["admin", "superadmin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid data. isSuperAdmin must be boolean and role must be 'admin' or 'superadmin'" },
        { status: 400 }
      );
    }

    const admin = await Admin.findByIdAndUpdate(
      id,
      { isSuperAdmin, role },
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
        message: "Admin super admin status updated successfully",
        admin: {
          _id: (admin._id as Types.ObjectId).toString(),
          username: admin.username,
          email: admin.email,
          role: admin.role || "admin",
          status: admin.status || "active",
          isSuperAdmin: admin.isSuperAdmin || false,
          createdAt: admin.createdAt ? new Date(admin.createdAt).toISOString() : null,
          lastLogin: admin.lastLogin ? new Date(admin.lastLogin).toISOString() : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating admin super admin status:", error);
    return NextResponse.json(
      { error: "Failed to update admin super admin status" },
      { status: 500 }
    );
  }
}