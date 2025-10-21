import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import GameScore from '@/models/GameScore';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get('sortBy') || 'highScore'; // highScore, gamesPlayed, avgScore
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get all users with their stats
    const users = await User.find({})
      .select('username profilePic walletAddress nativeSegwitAddress taprootAddress totalScore gamesPlayed highScore inscriptionCount')
      .lean();

    // Calculate average scores and add rankings
    const leaderboardData = await Promise.all(
      users.map(async (user) => {
        const avgScore = user.gamesPlayed > 0 
          ? Math.round(user.totalScore / user.gamesPlayed) 
          : 0;

        // Get user's rank by high score
        const highScoreRank = await User.countDocuments({
          highScore: { $gt: user.highScore }
        }) + 1;

        // Get user's rank by games played
        const gamesPlayedRank = await User.countDocuments({
          gamesPlayed: { $gt: user.gamesPlayed }
        }) + 1;

        // Get user's rank by avg score
        const usersWithHigherAvg = await User.find({
          gamesPlayed: { $gt: 0 }
        }).lean();
        
        const avgScoreRank = usersWithHigherAvg.filter(u => {
          const theirAvg = u.totalScore / u.gamesPlayed;
          return theirAvg > avgScore;
        }).length + 1;

        return {
          ...user,
          avgScore,
          displayName: user.username || `${user.walletAddress?.slice(0, 6)}...${user.walletAddress?.slice(-4)}`,
          highScoreRank,
          gamesPlayedRank,
          avgScoreRank,
        };
      })
    );

    // Sort based on sortBy parameter
    leaderboardData.sort((a, b) => {
      switch (sortBy) {
        case 'gamesPlayed':
          return b.gamesPlayed - a.gamesPlayed;
        case 'avgScore':
          return b.avgScore - a.avgScore;
        case 'highScore':
        default:
          return b.highScore - a.highScore;
      }
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

