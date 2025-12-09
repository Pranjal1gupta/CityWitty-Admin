import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Franchise } from '@/models/Franchise';
import { Types } from 'mongoose';

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);

    let baseQuery: any = {};
    if (search) {
      baseQuery.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    let query: any = { ...baseQuery };
    if (status !== 'all') {
      query.status = status;
    }

    const totalCount = await Franchise.countDocuments(query);
    const franchises = await Franchise.find(query)
      .sort({ registrationDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const mappedFranchises = franchises.map((franchise: any) => ({
      id: franchise.franchiseId,
      name: franchise.businessName || franchise.fullName,
      franchisee: franchise.fullName,
      email: franchise.email,
      phone: franchise.phone,
      status: franchise.status === 'approved' ? 'active' : franchise.status === 'rejected' ? 'inactive' : 'pending',
      registrationDate: franchise.registrationDate ? new Date(franchise.registrationDate).toISOString().split('T')[0] : '',
      locations: 1,
      totalMerchants: 0,
      address: `${franchise.address?.address}, ${franchise.address?.city}, ${franchise.address?.state}`,
      territory: franchise.region?.regionName || '',
      franchiseFee: franchise.investmentAmount || 0,
      monthlyRevenue: 0,
      deactivationReason: '',
      _id: franchise._id.toString(),
    }));

    const stats = {
      totalFranchises: await Franchise.countDocuments({}),
      activeFranchises: await Franchise.countDocuments({ status: 'approved' }),
      totalLocations: 0,
      pendingApplications: await Franchise.countDocuments({ status: 'pending' }),
    };

    return NextResponse.json(
      { franchises: mappedFranchises, stats, totalCount },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching franchises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch franchises' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}
