import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { Types } from "mongoose";
import { autoUnlockExpiredAccounts } from "@/lib/autoUnlockAdmins";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    await autoUnlockExpiredAccounts();

    const { id } = params;
    const { status, accountLockReason, accountLockedUntil } = await request.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid admin ID" },
        { status: 400 }
      );
    }

    if (!status || !["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'active' or 'inactive'" },
        { status: 400 }
      );
    }

    const updateData: any = { status };

    if (status === "inactive") {
      if (accountLockReason) {
        updateData.accountLockReason = accountLockReason;
      }
      if (accountLockedUntil) {
        updateData.accountLockedUntil = new Date(accountLockedUntil);
      }
    } else if (status === "active") {
      updateData.accountLockedUntil = null;
      updateData.accountLockReason = "";
    }

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
        message: "Admin status updated successfully",
        admin: {
          _id: (admin._id as Types.ObjectId).toString(),
          username: admin.username,
          email: admin.email,
          role: admin.role || "admin",
          status: admin.status || "active",
          createdAt: admin.createdAt ? new Date(admin.createdAt).toISOString() : null,
          lastLogin: admin.lastLogin ? new Date(admin.lastLogin).toISOString() : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating admin status:", error);
    return NextResponse.json(
      { error: "Failed to update admin status" },
      { status: 500 }
    );
  }
}
