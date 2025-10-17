import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/partner/partner.schema';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { citywittyAssured, isVerified, isPremiumSeller, isTopMerchant, visibility } = body;

    const updateFields: any = {};
    if (typeof citywittyAssured === 'boolean') updateFields.citywittyAssured = citywittyAssured;
    if (typeof isVerified === 'boolean') updateFields.isVerified = isVerified;
    if (typeof isPremiumSeller === 'boolean') updateFields.isPremiumSeller = isPremiumSeller;
    if (typeof isTopMerchant === 'boolean') updateFields.isTopMerchant = isTopMerchant;
    if (typeof visibility === 'boolean') updateFields.visibility = visibility;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updatedPartner = await Partner.findOneAndUpdate(
      { $or: [{ _id: id }, { merchantId: id }] },
      updateFields,
      { new: true }
    ).lean();

    if (!updatedPartner) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPartner, { status: 200 });
  } catch (error) {
    console.error('Error updating merchant statuses:', error);
    return NextResponse.json({ error: 'Failed to update statuses' }, { status: 500 });
  }
}
