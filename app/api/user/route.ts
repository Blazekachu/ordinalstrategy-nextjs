import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const privyId = searchParams.get('privyId');

    if (!privyId) {
      return NextResponse.json({ error: 'PrivyId required' }, { status: 400 });
    }

    await dbConnect();
    let user = await User.findOne({ privyId });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({ privyId });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privyId, twitterHandle, twitterId, walletAddress } = body;

    if (!privyId) {
      return NextResponse.json({ error: 'PrivyId required' }, { status: 400 });
    }

    await dbConnect();
    
    const user = await User.findOneAndUpdate(
      { privyId },
      {
        $set: {
          twitterHandle,
          twitterId,
          walletAddress,
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

