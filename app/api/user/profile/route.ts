import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      walletAddress, 
      username, 
      profilePic,
      nativeSegwitAddress,
      taprootAddress,
      sparkAddress,
      inscriptionCount
    } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await User.findOne({ walletAddress });

    if (!user) {
      user = await User.create({
        privyId: walletAddress, // Use wallet as privyId for Xverse users
        walletAddress,
        username,
        profilePic,
        nativeSegwitAddress,
        taprootAddress,
        sparkAddress,
        inscriptionCount: inscriptionCount || 0,
      });
    } else {
      // Update user
      if (username !== undefined) user.username = username;
      if (profilePic !== undefined) user.profilePic = profilePic;
      if (nativeSegwitAddress !== undefined) user.nativeSegwitAddress = nativeSegwitAddress;
      if (taprootAddress !== undefined) user.taprootAddress = taprootAddress;
      if (sparkAddress !== undefined) user.sparkAddress = sparkAddress;
      if (inscriptionCount !== undefined) user.inscriptionCount = inscriptionCount;
      
      await user.save();
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ walletAddress });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

