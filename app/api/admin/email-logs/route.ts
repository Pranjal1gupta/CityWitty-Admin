import { NextResponse } from "next/server";
import { emailLogger } from "@/lib/email-logger";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const type = searchParams.get('type') as 'otp' | 'password_reset' | 'other' | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    const logs = emailLogger.getLogs(email || undefined, type || undefined, limit);
    const stats = emailLogger.getStats();

    return NextResponse.json({
      logs,
      stats,
      success: true
    });
  } catch (err) {
    console.error("Email logs error:", err);
    const error = err as Error;
    return NextResponse.json({
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
}