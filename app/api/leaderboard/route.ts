import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get('sortBy') || 'highScore'; // highScore, gamesPlayed, avgScore
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get all users with their stats
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('username, profile_pic, wallet_address, native_segwit_address, taproot_address, total_score, games_played, high_score, inscription_count');

    if (error) throw error;

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        leaderboard: [],
        total: 0
      });
    }

    // Calculate average scores and add rankings
    const leaderboardData = users.map((user: any) => {
      const avgScore = user.games_played > 0 
        ? Math.round(user.total_score / user.games_played) 
        : 0;

      return {
        ...user,
        avgScore,
        displayName: user.username || `${user.wallet_address?.slice(0, 6)}...${user.wallet_address?.slice(-4)}`,
      };
    });

    // Sort based on sortBy parameter
    leaderboardData.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'gamesPlayed':
          return b.games_played - a.games_played;
        case 'avgScore':
          return b.avgScore - a.avgScore;
        case 'highScore':
        default:
          return b.high_score - a.high_score;
      }
    });

    // Add ranks after sorting
    leaderboardData.forEach((user: any, index: number) => {
      // Calculate ranks for each category
      const highScoreRank = leaderboardData.filter((u: any) => u.high_score > user.high_score).length + 1;
      const gamesPlayedRank = leaderboardData.filter((u: any) => u.games_played > user.games_played).length + 1;
      const avgScoreRank = leaderboardData.filter((u: any) => u.avgScore > user.avgScore).length + 1;

      user.highScoreRank = highScoreRank;
      user.gamesPlayedRank = gamesPlayedRank;
      user.avgScoreRank = avgScoreRank;
    });

    // Limit results
    const limitedData = leaderboardData.slice(0, limit);

    return NextResponse.json({ 
      leaderboard: limitedData,
      total: leaderboardData.length
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
