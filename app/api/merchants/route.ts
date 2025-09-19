import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partners';

function mapStatus(status: string) {
  if (status === 'suspended') return 'inactive';
  return status;
}

function calculateMonthsSince(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.max(Math.floor(diff / (1000 * 60 * 60 * 24 * 30)), 1);
}

export async function GET() {
  try {
    await dbConnect();

    const partners = await Partner.find({}).lean();

    // Map partners to merchant data format
    const merchants = partners.map((partner) => {
      return {
        id: partner.applicationId,
        name: partner.businessName,
        email: partner.email,
        phone: partner.phone,
        category: partner.category,
        status: mapStatus(partner.status),
        registrationDate: partner.joinedSince.toISOString().split('T')[0], // YYYY-MM-DD
        address: partner.address,
        totalTransactions: partner.ratings ? partner.ratings.length : 0,
        totalRevenue: partner.averageMonthlyRevenue, // Display as range from database
        discountsOffered: partner.discountOffered,
        deactivationReason: partner.deactivationReason || '',
      };
    });

    // Calculate stats
    const totalMerchants = partners.length;
    const activeMerchants = partners.filter(p => p.status === 'active').length;
    const pendingApprovals = partners.filter(p => p.status === 'pending').length;
    const inactiveMerchants = partners.filter(p => p.status === 'suspended').length;

    const stats = {
      totalMerchants,
      activeMerchants,
      pendingApprovals,
      inactiveMerchants,
    };

    return NextResponse.json({ merchants, stats });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    return NextResponse.json({ error: 'Failed to fetch merchants' }, { status: 500 });
  }
}
