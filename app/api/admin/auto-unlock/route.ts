import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { autoUnlockExpiredAccounts } from "@/lib/autoUnlockAdmins";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    await dbConnect();

    const result = await autoUnlockExpiredAccounts();

    return NextResponse.json(
      {
        success: true,
        message: "Auto-unlock process completed",
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in auto-unlock endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process auto-unlock" },
      { status: 500 }
    );
  }
}
