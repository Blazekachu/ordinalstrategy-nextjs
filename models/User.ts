import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  privyId: string;
  twitterHandle?: string;
  twitterId?: string;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  totalScore: number;
  gamesPlayed: number;
}

const UserSchema = new Schema<IUser>(
  {
    privyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    twitterHandle: {
      type: String,
      sparse: true,
    },
    twitterId: {
      type: String,
      sparse: true,
    },
    walletAddress: {
      type: String,
      sparse: true,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    gamesPlayed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

