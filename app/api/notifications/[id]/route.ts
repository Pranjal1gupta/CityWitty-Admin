import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Types } from 'mongoose';
import Notification from '@/models/Notification';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    const notification = await Notification.findById(id).lean();

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        _id: (notification._id as Types.ObjectId).toString(),
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { title, message, type, audience, targetId, icon, additional, status } = body;

    const existingNotification = await Notification.findById(id);
    if (!existingNotification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      {
        title,
        message,
        type,
        audience,
        targetId: targetId || undefined,
        icon,
        additional: additional || undefined,
        status: status || 'sent',
      },
      { new: true, runValidators: true }
    );

    if (!updatedNotification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully',
      notification: {
        ...updatedNotification.toObject(),
        _id: updatedNotification._id.toString(),
        createdAt: updatedNotification.createdAt.toISOString(),
        updatedAt: updatedNotification.updatedAt.toISOString(),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating notification:', error);
    let errorMessage = 'Failed to update notification';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { success: false, message: errorMessage },
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

    const { id } = params;

    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
