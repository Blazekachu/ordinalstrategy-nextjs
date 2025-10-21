import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const privyId = searchParams.get('privyId');

    if (!privyId) {
      return NextResponse.json({ error: 'PrivyId required' }, { status: 400 });
    }

    // Find user by privyId
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('privy_id', privyId)
      .limit(1);

    let user;

    if (!existingUsers || existingUsers.length === 0) {
      // Create new user if doesn't exist
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({
          privy_id: privyId,
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

    // Find or create user
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('privy_id', privyId)
      .limit(1);

    let user;

    if (!existingUsers || existingUsers.length === 0) {
      // Create new user
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({
          privy_id: privyId,
          twitter_handle: twitterHandle,
          twitter_id: twitterId,
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
      // Update existing user
      const { data: updatedUser, error } = await supabaseAdmin
        .from('users')
        .update({
          twitter_handle: twitterHandle,
          twitter_id: twitterId,
          wallet_address: walletAddress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUsers[0].id)
        .select()
        .single();

      if (error) throw error;
      user = updatedUser;
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
