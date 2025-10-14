import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Disable ISR / caching
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find({}).lean();

    // Map users to simplified format for dropdown
    const userOptions = users.map((user) => ({
      value: user.userId,
      label: `${user.name} (${user.email})`,
    }));

    return NextResponse.json(
      { userOptions },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error('Error fetching user options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user options' },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
