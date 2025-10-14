import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/partner/partner.schema';

// Disable ISR / caching
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();

    const partners = await Partner.find({}).lean();

    // Map partners to simplified format for dropdown
    const merchantOptions = partners.map((partner) => ({
      value: partner.merchantId,
      label: `${partner.displayName} (${partner.email})`,
    }));

    return NextResponse.json(
      { merchantOptions },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error('Error fetching merchant options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch merchant options' },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
