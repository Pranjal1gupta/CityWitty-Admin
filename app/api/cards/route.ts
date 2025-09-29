
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Types } from 'mongoose';
import User from '@/models/User';

// Disable ISR / caching
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch all users
    const users = await User.find({}).lean();
    
    // Calculate stats
    const totalUsers = users.length;
    const totalCards = users.filter(user => user.isCardExist).length;
    const activeCards = users.filter(user => user.cardStatus === 'active').length;
    const expiredCards = users.filter(user => user.cardStatus === 'expired').length;

    // Map users to card data format
    const cards = users.map(user => {
      // Calculate transactions count
      const transactions = user.orderHistory?.length || 0;

      // Determine lastUsed
      let lastUsed: string | null = null;
      if (user.orderHistory && user.orderHistory.length > 0) {
        const latestOrder = user.orderHistory.reduce((latest: any, current: any) => {
          return new Date(current.date) > new Date(latest.date) ? current : latest;
        }, user.orderHistory[0]);
        lastUsed = latestOrder.date ? new Date(latestOrder.date).toISOString().split('T')[0] : null;
      } else if (user.lastLogin) {
        lastUsed = new Date(user.lastLogin).toISOString().split('T')[0];
      }

      return {
        id: user.cardNumber,
        userId: (user._id as any).toString(),
        userName: user.name,
        email: user.email,
        status: user.cardStatus || 'pending',
        isCardExist: user.isCardExist,
        issueDate: user.purchasedOn ? new Date(user.purchasedOn).toISOString().split('T')[0] : null,
        expiryDate: user.validUpto ? new Date(user.validUpto).toISOString().split('T')[0] : null,
        lastUsed,
        transactions,
        savings: user.totalSavings || 0,
        statusReason: user.statusReason || '',
        cardVariantName: user.cardVariantName || '',
        mobileNumber: user.mobileNumber || '',
        whatsappNumber: user.whatsappNumber || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        state: user.state || '',
        country: user.country || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : null,
        lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : null,
        walletBalance: user.walletBalance || 0,
        totalPurchases: user.totalPurchases || 0,
        orderHistory: user.orderHistory || [],
        preferences: user.preferences || {},
        supportTickets: user.supportTickets || [],
      };
    });

    const stats = { totalCards, activeCards, totalUsers, expiredCards };

    return NextResponse.json(
      { cards, stats },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' }, // force fresh fetch
      }
    );
  } catch (error) {
    console.error('Error fetching cards data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  }
}

