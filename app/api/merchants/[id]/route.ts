import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/partner/partner.schema';

const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE ?? "";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    let body: any = null;
    try {
      body = await request.json();
    } catch (error) {
      body = null;
    }

    const secretCode = body?.secretCode;

    if (!ADMIN_SECRET_CODE) {
      return NextResponse.json({ error: 'Secret code not configured' }, { status: 500 });
    }

    if (secretCode !== ADMIN_SECRET_CODE) {
      return NextResponse.json({ error: 'Invalid secret code' }, { status: 403 });
    }

    const deletedPartner = await Partner.findOneAndDelete({
      $or: [{ _id: id }, { applicationId: id }],
    }).lean();

    if (!deletedPartner) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting merchant:', error);
    return NextResponse.json({ error: 'Failed to delete merchant' }, { status: 500 });
  }
}
