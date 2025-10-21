import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  privyId: string;
  username?: string;
  profilePic?: string;
  twitterHandle?: string;
  twitterId?: string;
  walletAddress?: string;
  nativeSegwitAddress?: string;
  taprootAddress?: string;
  sparkAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  totalScore: number;
  gamesPlayed: number;
  highScore: number;
  inscriptionCount: number;
}

const UserSchema = new Schema<IUser>(
  {
    privyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      sparse: true,
    },
    profilePic: {
      type: String,
      sparse: true,
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
    nativeSegwitAddress: {
      type: String,
      sparse: true,
    },
    taprootAddress: {
      type: String,
      sparse: true,
    },
    sparkAddress: {
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
    highScore: {
      type: Number,
      default: 0,
    },
    inscriptionCount: {
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

