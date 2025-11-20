import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { username, email, secretKey, role } = await request.json();

    if (!username || !email || !secretKey) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const validSecretKey = process.env.ADMIN_SECRET_CODE;
    if (secretKey !== validSecretKey) {
      return NextResponse.json(
        { error: "Invalid secret key" },
        { status: 403 }
      );
    }

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

    const hashedPassword = await bcrypt.hash(email, 12);

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

        const existingAdmin = await Admin.findOne({ uniqueId });
        if (!existingAdmin) {
          return uniqueId;
        }
      } while (attempts < maxAttempts);

      return `ADM${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 2).toUpperCase()}`;
    };

    const uniqueId = await generateUniqueId();

    const newAdmin = new Admin({
      uniqueId,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "admin",
      status: "active",
      isSuperAdmin: role === "superadmin",
    });

    await newAdmin.save();

    return NextResponse.json(
      {
        success: true,
        message: "Admin account created successfully",
        admin: {
          _id: (newAdmin._id as Types.ObjectId).toString(),
          uniqueId: newAdmin.uniqueId,
          username: newAdmin.username,
          email: newAdmin.email,
          role: newAdmin.role,
          status: newAdmin.status,
          isSuperAdmin: newAdmin.isSuperAdmin,
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
