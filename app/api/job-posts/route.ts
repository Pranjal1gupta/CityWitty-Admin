import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import JobPost from "@/models/JobPost";

// Disable ISR / caching
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const jobPosts = await JobPost.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { jobPosts },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Error fetching job posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch job posts" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const newJobPost = new JobPost({
      postName: postName.trim(),
      description: description.trim(),
      minQualification: minQualification.trim(),
      salary: salary?.trim() || undefined,
      openings: openings || undefined,
      locations: locations?.filter((loc: string) => loc.trim()) || [],
      applicationDeadline: parsedDeadline,
      workType: workType || undefined,
    });

    const savedJobPost = await newJobPost.save();

    return NextResponse.json(
      {
        success: true,
        jobPost: savedJobPost,
        message: "Job post created successfully"
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating job post:", error);

    // Handle duplicate key error or other mongoose errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A job post with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create job post" },
      { status: 500 }
    );
  }
}
