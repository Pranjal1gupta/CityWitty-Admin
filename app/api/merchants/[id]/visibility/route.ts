import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { visibility } = body;

    if (typeof visibility !== 'boolean') {
      return NextResponse.json({ error: 'Invalid visibility value' }, { status: 400 });
    }

    const updatedPartner = await Partner.findOneAndUpdate(
      { $or: [{ _id: id }, { merchantId: id }] },
      { visibility },
      { new: true }
    ).lean();

    if (!updatedPartner) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPartner, { status: 200 });
  } catch (error) {
    console.error('Error updating merchant visibility:', error);
    return NextResponse.json({ error: 'Failed to update visibility' }, { status: 500 });
  }
}
