import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/partner/partner.schema';

const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE ?? "";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { ListingLimit, totalGraphics, totalReels, isWebsite, totalPodcast, secretCode, bypassSecretCode } = body;

    // Allow updates if bypassSecretCode flag is true (for package-based updates)
    // OR if the correct secret code is provided (for manual limit adjustments)
    if (!bypassSecretCode) {
      if (!ADMIN_SECRET_CODE) {
        return NextResponse.json({ error: 'Secret code not configured' }, { status: 500 });
      }
      if (secretCode !== ADMIN_SECRET_CODE) {
        return NextResponse.json({ error: 'Invalid secret code' }, { status: 403 });
      }
    }

    const updateData: any = {};

    if (ListingLimit !== undefined) updateData.ListingLimit = ListingLimit;
    if (totalGraphics !== undefined) updateData.totalGraphics = totalGraphics;
    if (totalReels !== undefined) updateData.totalReels = totalReels;
    if (isWebsite !== undefined) updateData.isWebsite = isWebsite;
    if (totalPodcast !== undefined) updateData.totalPodcast = totalPodcast;

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
    console.error('Error updating merchant limits:', error);
    return NextResponse.json({ error: 'Failed to update limits' }, { status: 500 });
  }
}
