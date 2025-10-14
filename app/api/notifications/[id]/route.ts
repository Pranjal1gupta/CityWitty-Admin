import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const notification = await Notification.findById(params.id);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      title,
      message,
      type,
      status,
      target_audience,
      target_ids,
      icon,
      expires_at,
      additional_field,
    } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (target_audience !== undefined) updateData.target_audience = target_audience;
    if (target_ids !== undefined) updateData.target_ids = target_ids;
    if (icon !== undefined) updateData.icon = icon;
    if (expires_at !== undefined) updateData.expires_at = expires_at ? new Date(expires_at) : null;
    if (additional_field !== undefined) {
      // Convert object to Map for Mongoose schema
      if (typeof additional_field === 'object' && additional_field !== null) {
        updateData.additional_field = new Map(Object.entries(additional_field));
      } else {
        updateData.additional_field = additional_field;
      }
    }

    // Automatically update is_read array if target_ids or target_audience are being updated
    if (target_ids !== undefined || target_audience !== undefined) {
      // Get the current notification to access existing values
      const currentNotification = await Notification.findById(params.id);
      
      if (currentNotification) {
        const finalTargetIds = target_ids !== undefined ? target_ids : currentNotification.target_ids;
        const finalTargetAudience = target_audience !== undefined ? target_audience : currentNotification.target_audience;
        
        // Rebuild is_read array based on updated target_ids and target_audience
        updateData.is_read = (finalTargetIds || []).map((targetId: string) => ({
          target_id: targetId,
          target_type: finalTargetAudience,
          read: false,
          read_at: null,
        }));
      }
    }

    const notification = await Notification.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const notification = await Notification.findByIdAndDelete(params.id);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
