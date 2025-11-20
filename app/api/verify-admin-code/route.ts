import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    const secretCode = process.env.ADMIN_SECRET_CODE;

    if (!secretCode) {
      return NextResponse.json(
        { error: "Secret code is not configured" },
        { status: 500 }
      );
    }

    if (code !== secretCode) {
      return NextResponse.json(
        { error: "Invalid secret code" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Code verified" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying admin code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
