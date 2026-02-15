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


  dailyCredit: number;
  moneyCredit: number;
  coin: number;
  dailyRewardPending: number;
  lastDailyReward: Date;
  dailyVoteCount: number;
  lastVoteDate: Date;

  authentication?: {
    isResetPassword: boolean;
    otp: number | null;
    expireAt: Date | null;
  };

  stripeAccountInfo?: {
    stripeAccountId?: string;
    stripeAccountStatus?: 'pending' | 'active' | 'restricted';
    isCompleted: boolean;
    stripeConnectedAccount: string;
    loginUrl?: string;
  } | null;

  address?: string;
  fcmToken?: string;
  isMatchPassword(password: string): Promise<boolean>;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
