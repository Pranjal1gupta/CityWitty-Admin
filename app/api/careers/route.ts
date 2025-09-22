import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CareerApplication from "@/models/CareerApplication";

// Disable ISR / caching
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const applications = await CareerApplication.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const stats = {
      total: applications.length,
      pending: applications.filter((app: any) => app.status === "Pending")
        .length,
      called: applications.filter(
        (app: any) => app.status === "Called for Interview"
      ).length,
      selected: applications.filter((app: any) => app.status === "Selected")
        .length,
      rejected: applications.filter((app: any) => app.status === "Rejected")
        .length,
    };

    return NextResponse.json(
      { applications, stats },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" }, // force fresh fetch
      }
    );
  } catch (error) {
    console.error("Error fetching career applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch career applications" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }
}
