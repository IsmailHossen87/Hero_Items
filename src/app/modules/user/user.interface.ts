import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export interface IAuthProvider {
  provider: 'google' | 'credentials';
  providerId: string;
}

export type IUser = {
  name: string;
  role: USER_ROLES;
  contact: string;
  email: string;
  password: string;
  image?: string;
  coin: number;
  point: number;
  bio?: string;
  ranking: number;

  isFollowing: boolean;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  followersCount: number;
  followingCount: number;

  status: 'Active' | 'Blocked';
  verified: boolean;
  auths: IAuthProvider[];
  createdAt?: Date;
  updatedAt?: Date;
  lastDailyReward: Date;
  dailyRewardPending: number;

  authentication?: {
    isResetPassword: boolean;
    otp: number | null;
    expireAt: Date | null;
  };

  address?: string;
  // user.model.ts
  dailyVoteCount: number,
  lastVoteDate: Date,
  fcmToken?: string;


};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
