import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/Users';

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

    // Map users to card data format (include all users, even those without cards)
    const cards = users.map(user => {
        // Calculate transactions count from orderHistory
        const transactions = user.orderHistory ? user.orderHistory.length : 0;

        // For lastUsed, use the date of the last order or lastLogin
        let lastUsed = null;
        if (user.orderHistory && user.orderHistory.length > 0) {
          // Sort orderHistory by date descending and take the latest
          const sortedOrders = user.orderHistory.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          lastUsed = sortedOrders[0].date ? new Date(sortedOrders[0].date).toISOString().split('T')[0] : null;
        } else if (user.lastLogin) {
          lastUsed = new Date(user.lastLogin).toISOString().split('T')[0];
        }

        return {
          id: user.cardNumber, // Use cardNumber if exists, else generate from _id
          userId: (user._id as any).toString(),
          userName: user.name,
          email: user.email,
          status: user.cardStatus || (user.isCardExist ? 'pending' : 'no-card'),
          isCardExist: user.isCardExist,
          issueDate: user.purchasedOn ? new Date(user.purchasedOn).toISOString().split('T')[0] : null,
          expiryDate: user.validUpto ? new Date(user.validUpto).toISOString().split('T')[0] : null,
          lastUsed: lastUsed,
          transactions: transactions,
          savings: user.totalSavings || 0,
          statusReason: user.statusReason || '',
          // Additional user details
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

    const stats = {
      totalCards,
      activeCards,
      totalUsers,
      expiredCards,
    };

    return NextResponse.json({ cards, stats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching cards data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
