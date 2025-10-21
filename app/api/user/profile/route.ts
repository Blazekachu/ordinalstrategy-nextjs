import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
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
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('wallet_address', walletAddress)
        .neq('privy_id', walletAddress)
        .single();
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken. Please choose a different one.' },
          { status: 400 }
        );
      }
    }

    // Find user by wallet address OR privyId
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`wallet_address.eq.${walletAddress},privy_id.eq.${walletAddress}`)
      .limit(1);

    let user;

    if (!existingUsers || existingUsers.length === 0) {
      // Create new user
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({
          privy_id: walletAddress,
          wallet_address: walletAddress,
          username: username || null,
          profile_pic: profilePic || null,
          native_segwit_address: nativeSegwitAddress || null,
          taproot_address: taprootAddress || null,
          spark_address: sparkAddress || null,
          inscription_count: inscriptionCount || 0,
          total_score: 0,
          games_played: 0,
          high_score: 0,
        })
        .select()
        .single();

      if (error) throw error;
      user = newUser;
    } else {
      // Update existing user
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (username !== undefined) updateData.username = username;
      if (profilePic !== undefined) updateData.profile_pic = profilePic;
      if (nativeSegwitAddress !== undefined) updateData.native_segwit_address = nativeSegwitAddress;
      if (taprootAddress !== undefined) updateData.taproot_address = taprootAddress;
      if (sparkAddress !== undefined) updateData.spark_address = sparkAddress;
      if (inscriptionCount !== undefined) updateData.inscription_count = inscriptionCount;

      // Ensure wallet_address is set
      if (!existingUsers[0].wallet_address) {
        updateData.wallet_address = walletAddress;
      }

      const { data: updatedUser, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', existingUsers[0].id)
        .select()
        .single();

      if (error) throw error;
      user = updatedUser;
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
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Find user by wallet address OR privyId
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`wallet_address.eq.${walletAddress},privy_id.eq.${walletAddress}`)
      .limit(1);

    let user;

    if (!existingUsers || existingUsers.length === 0) {
      // Create a new user if not found
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({
          privy_id: walletAddress,
          wallet_address: walletAddress,
          total_score: 0,
          games_played: 0,
          high_score: 0,
          inscription_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      user = newUser;
    } else {
      user = existingUsers[0];
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
