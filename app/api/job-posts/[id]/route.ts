import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import JobPost from "@/models/JobPost";

// Disable ISR / caching
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const jobPost = await JobPost.findById(params.id).lean();

    if (!jobPost) {
      return NextResponse.json(
        { error: "Job post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { jobPost },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Error fetching job post:", error);
    return NextResponse.json(
      { error: "Failed to fetch job post" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      postName,
      description,
      minQualification,
      salary,
      openings,
      locations,
      applicationDeadline,
      workType,
    } = body;

    // Basic validation
    if (!postName || !description || !minQualification) {
      return NextResponse.json(
        { error: "Post name, description, and minimum qualification are required" },
        { status: 400 }
      );
    }

    // Validate workType if provided
    if (workType && !["Remote", "On-site", "Hybrid"].includes(workType)) {
      return NextResponse.json(
        { error: "Invalid work type. Must be Remote, On-site, or Hybrid" },
        { status: 400 }
      );
    }

    // Validate openings if provided
    if (openings && (typeof openings !== "number" || openings < 1)) {
      return NextResponse.json(
        { error: "Openings must be a positive number" },
        { status: 400 }
      );
    }

    // Validate applicationDeadline if provided
    let parsedDeadline = undefined;
    if (applicationDeadline) {
      parsedDeadline = new Date(applicationDeadline);
      if (isNaN(parsedDeadline.getTime())) {
        return NextResponse.json(
          { error: "Invalid application deadline format" },
          { status: 400 }
        );
      }
    }

    const updatedJobPost = await JobPost.findByIdAndUpdate(
      params.id,
      {
        postName: postName.trim(),
        description: description.trim(),
        minQualification: minQualification.trim(),
        salary: salary?.trim() || undefined,
        openings: openings || undefined,
        locations: locations?.filter((loc: string) => loc.trim()) || [],
        applicationDeadline: parsedDeadline,
        workType: workType || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updatedJobPost) {
      return NextResponse.json(
        { error: "Job post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        jobPost: updatedJobPost,
        message: "Job post updated successfully"
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating job post:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A job post with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update job post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const deletedJobPost = await JobPost.findByIdAndDelete(params.id);

    if (!deletedJobPost) {
      return NextResponse.json(
        { error: "Job post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Job post deleted successfully"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting job post:", error);
    return NextResponse.json(
      { error: "Failed to delete job post" },
      { status: 500 }
    );
  }
}
