import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GameScore from '@/models/GameScore';
import User from '@/models/User';

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

    await dbConnect();

    // Find or create user - privyId is now the wallet address
    let user = await User.findOne({ 
      $or: [
        { privyId: privyId },
        { walletAddress: privyId }
      ]
    });
    
    if (!user) {
      // Create new user with wallet address
      user = await User.create({ 
        privyId: privyId,
        walletAddress: privyId,
        totalScore: 0,
        gamesPlayed: 0,
        highScore: 0,
        inscriptionCount: 0,
      });
    }

    // Create game score
    const gameScore = await GameScore.create({
      userId: user._id,
      gameName,
      score,
      level: level || 1,
      coinsCollected: coinsCollected || 0,
      playTime: playTime || 0,
    });

    // Update user stats
    const updateData: any = {
      $inc: {
        totalScore: score,
        gamesPlayed: 1,
      },
    };

    // Update high score if this score is higher
    if (score > (user.highScore || 0)) {
      updateData.$set = { highScore: score };
    }

    await User.findByIdAndUpdate(user._id, updateData);

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

    await dbConnect();

    if (type === 'user' && (privyId || walletAddress)) {
      // Get user's scores - support both privyId and walletAddress
      const searchAddress = privyId || walletAddress;
      const user = await User.findOne({ 
        $or: [
          { privyId: searchAddress },
          { walletAddress: searchAddress }
        ]
      });
      
      if (!user) {
        return NextResponse.json({ scores: [], user: null }, { status: 200 });
      }

      const scores = await GameScore.find({
        userId: user._id,
        gameName,
      })
        .sort({ createdAt: -1 })
        .limit(limit);

      return NextResponse.json({ scores, user }, { status: 200 });
    } else {
      // Get leaderboard (top scores)
      const scores = await GameScore.find({ gameName })
        .sort({ score: -1 })
        .limit(limit)
        .populate('userId', 'username twitterHandle privyId walletAddress totalScore highScore');

      return NextResponse.json({ scores }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}

