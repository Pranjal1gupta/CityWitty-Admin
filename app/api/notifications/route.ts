import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const targetAudience = searchParams.get("targetAudience") || "";

    const skip = (page - 1) * limit;

    let query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (targetAudience && targetAudience !== "all") {
      query.target_audience = targetAudience;
    }

    let notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Auto-expire notifications that have passed their expiration time
    const now = new Date();
    notifications = await Promise.all(
      notifications.map(async (notif: any) => {
        if (notif.expires_at && new Date(notif.expires_at) < now && notif.status !== "expired") {
          // Update the notification to expired status in the database
          await Notification.findByIdAndUpdate(
            notif._id,
            { status: "expired" },
            { new: true }
          );
          // Update the returned notification object
          notif.status = "expired";
        }
        return notif;
      })
    );

    const total = await Notification.countDocuments(query);

    return NextResponse.json({
      notifications,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      title,
      message,
      type,
      target_audience,
      target_ids,
      icon,
      link,
      expires_at,
      additional_field,
    } = body;

    // Validate required fields
    if (!title || !message || !target_audience) {
      return NextResponse.json(
        { error: "Title, message, and target audience are required" },
        { status: 400 }
      );
    }

    // Automatically populate is_read array based on target_ids and target_audience
    const isReadArray = (target_ids || []).map((targetId: string) => ({
      target_id: targetId,
      target_type: target_audience,
      read: false,
      read_at: null,
    }));

    // Create notification
    const notificationData: any = {
      title,
      message,
      type: type || "info",
      status: "draft",
      target_audience,
      target_ids: target_ids || [],
      icon: icon || "",
      link: link || "",
      expires_at: expires_at ? new Date(expires_at) : null,
      is_read: isReadArray, // Automatically populated from target_ids
    };

    // Only add additional_field if it has content
    if (additional_field && Object.keys(additional_field).length > 0) {
      notificationData.additional_field = new Map(Object.entries(additional_field));
    }

    const notification = new Notification(notificationData);

    await notification.save();

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error("Error creating notification:", error);
    
    // Provide more detailed error message
    const errorMessage = error.message || "Failed to create notification";
    const statusCode = error.name === "ValidationError" ? 400 : 500;
    
    return NextResponse.json(
      { error: errorMessage, details: error.errors || {} },
      { status: statusCode }
    );
  }
}
