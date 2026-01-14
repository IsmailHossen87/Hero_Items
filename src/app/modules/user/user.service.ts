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


export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  getAllUser,
  updateProfileToDB,
  followUser,
};
