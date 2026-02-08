import bcrypt from 'bcrypt';
import { model, Schema } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
// import AppError from '../../../errors/AppError'; 


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
    image: { type: String },
    bio: { type: String, default: '', },

    dailyCredit: { type: Number, default: 0, },
    moneyCredit: { type: Number, default: 0, },
    coin: { type: Number },

    ranking: { type: Number },
    dailyRewardPending: { type: Number, default: 0 },
    dailyVoteCount: { type: Number, default: 0 },
    lastVoteDate: { type: Date },
    lastDailyReward: { type: Date },
    status: { type: String, enum: ['Active', 'Blocked'], default: 'Active', },

    isFollowing: { type: Boolean, default: false },
    followers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    // FOLLOWING
    following: [
      { type: Schema.Types.ObjectId, ref: "User", default: [] }
    ],
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },


    authentication: {
      isResetPassword: { type: Boolean, default: false },
      otp: { type: Number, default: null },
      expireAt: { type: Date, default: null },
    },
    verified: { type: Boolean, default: false, },
    address: { type: String, default: '', },
    fcmToken: { type: String, default: '', },
  },
  { timestamps: true, versionKey: false }
);

userSchema.statics.isExistUserById = async (id: string) => {
  return await User.findById(id);
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

// In the schema definition
userSchema.methods.isMatchPassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};




export const User = model<IUser, UserModal>('User', userSchema);


