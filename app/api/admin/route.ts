import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import { autoUnlockExpiredAccounts } from "@/lib/autoUnlockAdmins";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    await dbConnect();

    await autoUnlockExpiredAccounts();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "all";
    const role = url.searchParams.get("role") || "all";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    let query: any = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status !== "all") {
      query.status = status;
    }

    if (role !== "all") {
      query.role = role;
    }

    const totalCount = await Admin.countDocuments(query);
    const admins = await Admin.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const adminsList = admins.map((admin: any) => ({
      _id: (admin._id as Types.ObjectId).toString(),
      uniqueId: admin.uniqueId,
      username: admin.username,
      email: admin.email,
      phone: admin.phone,
      address: admin.address,
      role: admin.role || "admin",
      status: admin.status || "active",
      avatar: admin.avatar,
      isSuperAdmin: admin.isSuperAdmin || false,
      accountLockedUntil: admin.accountLockedUntil ? new Date(admin.accountLockedUntil).toISOString() : null,
      accountLockReason: admin.accountLockReason,
      lastLogin: admin.lastLogin ? new Date(admin.lastLogin).toISOString() : null,
      lastLoginIP: admin.lastLoginIP,
      failedLoginAttempts: admin.failedLoginAttempts || 0,
      permissions: admin.permissions || [],
      createdBy: admin.createdBy,
      updatedBy: admin.updatedBy,
      createdAt: admin.createdAt ? new Date(admin.createdAt).toISOString() : null,
      updatedAt: admin.updatedAt ? new Date(admin.updatedAt).toISOString() : null,
      meta: admin.meta,
    }));

    const stats = {
      totalAdmins: await Admin.countDocuments({}),
      activeAdmins: await Admin.countDocuments({ status: "active" }),
      inactiveAdmins: await Admin.countDocuments({ status: "inactive" }),
      totalSuperAdmins: await Admin.countDocuments({ isSuperAdmin: true }),
    };

    return NextResponse.json(
      { admins: adminsList, stats, totalCount },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { username, email, password, secretCode } = await request.json();

    // Validate required fields
    if (!username || !email || !password || !secretCode) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate secret code (you can change this to an environment variable)
    const validSecretCode = process.env.ADMIN_SECRET_CODE || "CITYWITTY_ADMIN_2024";
    if (secretCode !== validSecretCode) {
      return NextResponse.json(
        { error: "Invalid secret code" },
        { status: 403 }
      );
    }

    // Check if username or email already exists
    const existingAdmin = await Admin.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique 8-digit alphanumeric ID
    const generateUniqueId = async (): Promise<string> => {
      const chars = 'ABC013DEFGHI456JKLMNOPQR789STUVW2XYZ';
      let uniqueId: string;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        uniqueId = 'ADMIN-';
        for (let i = 0; i < 8; i++) {
          uniqueId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        attempts++;

        // Check if this ID already exists
        const existingAdmin = await Admin.findOne({ uniqueId });
        if (!existingAdmin) {
          return uniqueId;
        }
      } while (attempts < maxAttempts);

      // If we can't generate a unique ID after max attempts, use timestamp-based fallback
      return `ADM${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 2).toUpperCase()}`;
    };

    const uniqueId = await generateUniqueId();

    // Create new admin
    const newAdmin = new Admin({
      uniqueId,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      status: "active",
      isSuperAdmin: false,
    });

    await newAdmin.save();

    return NextResponse.json(
      {
        success: true,
        message: "Admin account created successfully",
        admin: {
          id: newAdmin._id,
          username: newAdmin.username,
          email: newAdmin.email,
          role: newAdmin.role,
          status: newAdmin.status,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin account" },
      { status: 500 }
    );
  }
}
