import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CareerApplication from "@/models/CareerApplication";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const deletedApplication = await CareerApplication.findByIdAndDelete(params.id);

    if (!deletedApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
