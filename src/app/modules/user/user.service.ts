import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../../errors/AppError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import { IUser } from './user.interface';
import { User } from './user.model';
import { redisClient } from '../../../config/radisConfig';
import { Car } from '../Car/car.model';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../../config';
import generateNumber from '../../../util/generateOTP';
import { USER_ROLES } from '../../../enums/user';
import httpStatus from 'http-status-codes';


const OTP_EXPIRATION = 2 * 60;
// const getRandomCoins = (min = 5, max = 100) => {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// };
export const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};





const createUUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  let createUser;
  const { email, password } = payload;
  if (email && password) {
    const auths = [{
      provider: 'credentials',
      providerId: '',
    }];
    const passwordHash = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
    const data = {
      ...payload,
      auths,
      password: passwordHash
    }

    createUser = await User.create(data);
  }


  if (!createUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }
  const otp = generateNumber();
  const redisKey = `otp:verify:${createUser.email}`;

  console.log("redisKey-------------1", redisKey)


  await redisClient.setEx(redisKey, OTP_EXPIRATION, otp.toString());

  const values = {
    name: createUser.name,
    otp,
    email: createUser.email!,
  };

  const createAccountTemplate = emailTemplate.createAccount(values);
  await emailHelper.sendEmail(createAccountTemplate);

  return createUser;
};


const getUserProfileFromDB = async (
  user: JwtPayload,
  userId: string
) => {
  const { id } = user;
  let userData;
  if (userId) {
    userData = await User.findById(userId).select("-followers -following -auths -authentication").lean();
  } else {
    userData = await User.findById(id).select("-followers -following -auths -authentication").lean();
  }
  const car = await Car.find({ userId: userData?._id });
  if (!userData) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return {
    totalCar: car.length,
    totalVote: car.reduce((acc, car) => acc + car.votes, 0),
    ...userData,
  };
};



const getAllUser = async () => {
  const isExistUser = await User.find();
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }


  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (payload.image && isExistUser.image) {
    unlinkFile(isExistUser.image);
  }

  return updateDoc;
};

// follow user
const followUser = async (
  user: JwtPayload, // Logged-in user
  targetUserId: string,
): Promise<{ targetUser: IUser; isFollowing: boolean }> => {
  // 1️⃣ Prevent self-follow
  if (user.id === targetUserId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "You cannot follow yourself");
  }

  // 2️⃣ Get target user and current user
  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(user.id);

  if (!targetUser || !currentUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  let isFollowing: boolean;

  // 3️⃣ Check if already following
  if (targetUser.followers.includes(new Types.ObjectId(user.id))) {
    // Already following → Unfollow
    targetUser.followers = targetUser.followers.filter(
      f => f.toString() !== user.id
    );
    targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);

    currentUser.following = currentUser.following.filter(
      f => f.toString() !== targetUserId
    );
    currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);

    isFollowing = false;
  } else {
    // Not following → Follow
    targetUser.followers.push(new Types.ObjectId(user.id));
    targetUser.followersCount += 1;

    currentUser.following.push(new Types.ObjectId(targetUserId));
    currentUser.followingCount += 1;

    isFollowing = true;
  }

  // 4️⃣ Save changes
  await targetUser.save();
  await currentUser.save();

  // 5️⃣ Update target user's isFollowing from current user's perspective
  targetUser.isFollowing = isFollowing;

  return { targetUser, isFollowing };
};



// 🔄️🔄️🔄️🔄️
const previewDailyReward = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const today = new Date();

  // Already claimed today?
  if (user.lastDailyReward && isSameDay(user.lastDailyReward, today)) {
    return {
      success: false,
      message: "Already claimed today",
      preview: 0
    };
  }

  // Random coins for preview
  const reward = 100;
  user.dailyRewardPending = reward;
  await user.save();

  return {
    success: true,
    message: `You can claim ${reward} coins today`,
    preview: reward
  };
};


const claimDailyReward = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const today = new Date();

  if (user.lastDailyReward && isSameDay(user.lastDailyReward, today)) {
    return {
      success: false,
      message: "Already claimed today",
      credit: user.dailyCredit
    };
  }

  // Add pending coins to actual coins
  const reward = user.dailyRewardPending || 100;

  user.dailyCredit += reward;
  user.lastDailyReward = today;
  user.dailyRewardPending = 0;
  await user.save();

  return {
    success: true,
    message: `You claimed ${reward} coins 🎉`,
    credit: user.dailyCredit
  };
};


const deleteUser = async (
  owner: JwtPayload,
  userId?: string,
  password?: string
) => {
  // 👤 USER deletes own account
  if (owner.role === USER_ROLES.USER) {
    if (!password) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Password is required to delete your account"
      );
    }

    const user = await User.findById(owner.id).select("password");
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const isMatch = await bcrypt.compare(password as string, user.password as string);
    if (!isMatch) {
      throw new AppError(httpStatus.EXPECTATION_FAILED, "Incorrect password");
    }
    return await userDeleteFunc(owner.id);
  }

  // 🛡️ ADMIN deletes other user
  if (owner.role === USER_ROLES.ADMIN && userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if ((owner.role === USER_ROLES.ADMIN) && (user.role === USER_ROLES.ADMIN)) {
      throw new AppError(httpStatus.FORBIDDEN, "Admin Can not delete another admin");
    }

    return await userDeleteFunc(userId);
  }
  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
};

const userDeleteFunc = async (userId: string) => {
  console.log("check 4")
  const result = await User.findByIdAndUpdate(
    userId,
    {
      name: "",
      email: "",
      password: "",
      image: "",
      followers: [],
      following: [],
      auths: [],
      authentication: {},
      isDeleted: true,
      deletedAt: new Date()
    },
    { new: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return null;
};


export const UserService = {
  createUUserToDB,
  getUserProfileFromDB,
  getAllUser,
  updateProfileToDB,
  followUser,
  previewDailyReward,
  claimDailyReward,
  deleteUser,
};
