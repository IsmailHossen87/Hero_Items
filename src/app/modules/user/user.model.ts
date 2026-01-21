import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
// import AppError from '../../../errors/AppError'; 
import AppError from '../../../errors/AppError';

import { IAuthProvider, IUser, UserModal } from './user.interface';

const authProviderSchema = new Schema<IAuthProvider>({
  provider: { type: String, required: true },
  providerId: { type: String },
}, { _id: false, timestamps: false, versionKey: false });


const userSchema = new Schema<IUser, UserModal>(
  {
    name: { type: String, required: true, },
    role: { type: String, enum: Object.values(USER_ROLES), default: USER_ROLES.USER, },
    email: { type: String, required: true, unique: true, lowercase: true, },
    contact: { type: String, default: '', },
    password: { type: String, required: true, select: 0, minlength: 8, },
    auths: [authProviderSchema],
    image: { type: String, default: 'https://i.ibb.co/z5YHLV9/profile.png', },
    bio: { type: String, default: '', },
    // FOLLOWERS
    followers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    // FOLLOWING
    following: [
      { type: Schema.Types.ObjectId, ref: "User", default: [] }
    ],
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },


    coin: { type: Number, default: 0, },
    point: { type: Number, default: 0, },
    ranking: { type: Number, default: 0, },
    lastDailyReward: { type: Date, default: null, },
    dailyRewardPending: { type: Number, default: 0 },
    dailyVoteCount: { type: Number, default: 0 },
    lastVoteDate: { type: Date },
    status: { type: String, enum: ['Active', 'Blocked'], default: 'Active', },
    authentication: {
      isResetPassword: { type: Boolean, default: false },
      otp: { type: Number, default: null },
      expireAt: { type: Date, default: null },
    },
    verified: { type: Boolean, default: false, },
  },
  { timestamps: true, versionKey: false }
);

userSchema.statics.isExistUserById = async (id: string) => {
  return await User.findById(id);
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

// match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

// pre-save hook
userSchema.pre('save', async function (next) {
  const isExist = await User.findOne({ email: this.email });
  if (isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Email already exists!');
  }

  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const User = model<IUser, UserModal>('User', userSchema);


