import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import AppError from '../../../errors/AppError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { redisClient } from '../../../config/radisConfig';
import { Car } from '../Car/car.model';


const OTP_EXPIRATION = 2 * 60;
const getRandomCoins = (min = 5, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};





const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  let createUser;
  const { email, password } = payload;
  if (email && password) {
    const auths = [{
      provider: 'credentials',
      providerId: '',
    }];

    createUser = await User.create({ auths, ...payload });
  }

  if (!createUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  const otp = generateOTP();
  const redisKey = `otp:verify:${createUser.email}`;
  await redisClient.setEx(redisKey, OTP_EXPIRATION, otp.toString());

  const values = {
    name: createUser.name,
    otp,
    email: createUser.email!,
  };

  const createAccountTemplate = emailTemplate.createAccount(values);
  await emailHelper.sendEmail(createAccountTemplate);

  // let stripeCustomer;
  // try {
  //   stripeCustomer = await stripe.customers.create({
  //     email: createUser.email,
  //     name: createUser.name,
  //   });
  // } catch (error) {
  //   throw new AppError(
  //     StatusCodes.INTERNAL_SERVER_ERROR,
  //     'Failed to create Stripe customer'
  //   );
  // }

  // await User.findOneAndUpdate(
  //   { _id: createUser._id },
  //   {
  //     $set: {
  //       stripeAccountInfo: { stripeCustomerId: stripeCustomer.id }
  //     }
  //   }
  // )

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload
) => {


  const { id } = user;
  const userData = await User.findById(id).lean();
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

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

// follow user
const followUser = async (user: JwtPayload, id: string) => {
  // id = target user (যাকে follow করা হচ্ছে)
  if (user.id === id) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You cannot follow yourself"
    );
  }

  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User doesn't exist!"
    );
  }

  // 1️⃣ Update target user (followers)
  const updateDoc = await User.findOneAndUpdate(
    {
      _id: id,
      followers: { $ne: user.id }
    },
    {
      $addToSet: { followers: user.id },
      $inc: { followersCount: 1 }
    },
    { new: true }
  );

  if (!updateDoc) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You already follow this user"
    );
  }

  // 2️⃣ Update current user (following)
  await User.findOneAndUpdate(
    {
      _id: user.id,
      following: { $ne: id }
    },
    {
      $addToSet: { following: id },
      $inc: { followingCount: 1 }
    }
  );

  return updateDoc;
};



// 🔄️🔄️🔄️🔄️
const previewDailyReward = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const today = new Date();

  // Already claimed today?
  if (user.lastDailyReward && isSameDay(user.lastDailyReward, today)) {
    return {
      message: "Already claimed today",
      preview: 0
    };
  }

  // Random coins for preview
  const reward = getRandomCoins(50, 100);
  user.dailyRewardPending = reward;
  await user.save();

  return {
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
      message: "Already claimed today",
      coins: user.coin
    };
  }

  // Add pending coins to actual coins
  const reward = user.dailyRewardPending || getRandomCoins(5, 20);
  user.coin += reward;
  user.lastDailyReward = today;
  user.dailyRewardPending = 0; // reset pending
  await user.save();

  return {
    message: `You claimed ${reward} coins 🎉`,
    coins: user.coin
  };
};






export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  getAllUser,
  updateProfileToDB,
  followUser,
  previewDailyReward,
  claimDailyReward,
};
