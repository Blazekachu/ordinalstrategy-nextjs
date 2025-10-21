import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST - Submit a new game score
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privyId, gameName, score, level, coinsCollected, playTime } = body;

    if (!privyId || !gameName || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create user - privyId is now the wallet address
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`privy_id.eq.${privyId},wallet_address.eq.${privyId}`)
      .limit(1);

    let user;

    if (!existingUsers || existingUsers.length === 0) {
      // Create new user with wallet address
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({
          privy_id: privyId,
          wallet_address: privyId,
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

    // Create game score
    const { data: gameScore, error: scoreError } = await supabaseAdmin
      .from('game_scores')
      .insert({
        user_id: user.id,
        game_type: gameName,
        score: score,
      })
      .select()
      .single();

    if (scoreError) throw scoreError;

    // Update user stats
    const newTotalScore = (user.total_score || 0) + score;
    const newGamesPlayed = (user.games_played || 0) + 1;
    const newHighScore = Math.max(user.high_score || 0, score);

    await supabaseAdmin
      .from('users')
      .update({
        total_score: newTotalScore,
        games_played: newGamesPlayed,
        high_score: newHighScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    return NextResponse.json({ gameScore, success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting score:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit score' }, { status: 500 });
  }
}

// GET - Get scores (leaderboard or user scores)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const privyId = searchParams.get('privyId');
    const walletAddress = searchParams.get('walletAddress');
    const gameName = searchParams.get('gameName') || 'foxjump';
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'leaderboard'; // 'leaderboard' or 'user'

    if (type === 'user' && (privyId || walletAddress)) {
      // Get user's scores - support both privyId and walletAddress
      const searchAddress = privyId || walletAddress;
      
      const { data: existingUsers } = await supabaseAdmin
        .from('users')
        .select('*')
        .or(`privy_id.eq.${searchAddress},wallet_address.eq.${searchAddress}`)
        .limit(1);

      if (!existingUsers || existingUsers.length === 0) {
        return NextResponse.json({ scores: [], user: null }, { status: 200 });
      }

      const user = existingUsers[0];

      const { data: scores } = await supabaseAdmin
        .from('game_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_type', gameName)
        .order('created_at', { ascending: false })
        .limit(limit);

      return NextResponse.json({ scores: scores || [], user }, { status: 200 });
    } else {
      // Get leaderboard (top scores)
      const { data: scores } = await supabaseAdmin
        .from('game_scores')
        .select(`
          *,
          users (
            username,
            twitter_handle,
            privy_id,
            wallet_address,
            total_score,
            high_score
          )
        `)
        .eq('game_type', gameName)
        .order('score', { ascending: false })
        .limit(limit);

      // Transform to match MongoDB format (userId -> users data)
      const transformedScores = scores?.map((score: any) => ({
        ...score,
        userId: score.users,
      })) || [];

      return NextResponse.json({ scores: transformedScores }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}
