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

    // Check if username is taken by another user
    if (username) {
      const existingUser = await User.findOne({ 
        username: username,
        $nor: [
          { walletAddress: walletAddress },
          { privyId: walletAddress }
        ]
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken. Please choose a different one.' },
          { status: 400 }
        );
      }
    }

    // Find user by wallet address OR privyId (since we use wallet as privyId)
    let user = await User.findOne({ 
      $or: [
        { walletAddress: walletAddress },
        { privyId: walletAddress }
      ]
    });

    if (!user) {
      // Create new user with wallet address as both privyId and walletAddress
      user = await User.create({
        privyId: walletAddress,
        walletAddress,
        username: username || undefined,
        profilePic: profilePic || undefined,
        nativeSegwitAddress,
        taprootAddress,
        sparkAddress,
        inscriptionCount: inscriptionCount || 0,
        totalScore: 0,
        gamesPlayed: 0,
        highScore: 0,
      });
    } else {
      // Update user fields
      if (username !== undefined) user.username = username;
      if (profilePic !== undefined) user.profilePic = profilePic;
      if (nativeSegwitAddress !== undefined) user.nativeSegwitAddress = nativeSegwitAddress;
      if (taprootAddress !== undefined) user.taprootAddress = taprootAddress;
      if (sparkAddress !== undefined) user.sparkAddress = sparkAddress;
      if (inscriptionCount !== undefined) user.inscriptionCount = inscriptionCount;
      
      // Ensure walletAddress is set if it wasn't before
      if (!user.walletAddress) {
        user.walletAddress = walletAddress;
      }
      
      await user.save();
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
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

    // Find user by wallet address OR privyId
    let user = await User.findOne({ 
      $or: [
        { walletAddress: walletAddress },
        { privyId: walletAddress }
      ]
    });

    if (!user) {
      // Create a new user if not found
      user = await User.create({
        privyId: walletAddress,
        walletAddress,
        totalScore: 0,
        gamesPlayed: 0,
        highScore: 0,
        inscriptionCount: 0,
      });
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

