import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/partner/partner.schema';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { status, statusReason } = body;

    if (!['active', 'blocked', 'expired', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const updateData: any = { cardStatus: status };
    if (statusReason) {
      updateData.statusReason = statusReason;
    } else if (status !== 'blocked') {
      // Clear statusReason if status is not blocked
      updateData.statusReason = '';
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      updateData,
      { new: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Card status updated successfully' });
  } catch (error) {
    console.error('Error updating card status:', error);
    return NextResponse.json({ error: 'Failed to update card status' }, { status: 500 });
  }
}
