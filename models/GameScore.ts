import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IGameScore {
  userId: Types.ObjectId;
  gameName: string;
  score: number;
  level: number;
  coinsCollected: number;
  playTime: number; // in seconds
  createdAt: Date;
}

const GameScoreSchema = new Schema<IGameScore>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    gameName: {
      type: String,
      required: true,
      enum: ['foxjump'],
      default: 'foxjump',
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    coinsCollected: {
      type: Number,
      default: 0,
      min: 0,
    },
    playTime: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for leaderboard queries
GameScoreSchema.index({ gameName: 1, score: -1 });
GameScoreSchema.index({ userId: 1, createdAt: -1 });

const GameScore: Model<IGameScore> =
  mongoose.models.GameScore || mongoose.model<IGameScore>('GameScore', GameScoreSchema);

export default GameScore;

