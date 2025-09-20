import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partners';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { status, deactivationReason } = body;

    if (!['active', 'pending', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const updateData: any = { status };

    if (deactivationReason) {
      updateData.deactivationReason = deactivationReason;
    } else if (status !== 'suspended') {
      updateData.deactivationReason = '';
    }

    const updatedPartner = await Partner.findOneAndUpdate(
      { $or: [{ _id: id }, { applicationId: id }] },
      updateData,
      { new: true }
    ).lean();

    if (!updatedPartner) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPartner, { status: 200 });
  } catch (error) {
    console.error('Error updating merchant status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
