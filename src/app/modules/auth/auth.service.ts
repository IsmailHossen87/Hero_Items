import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../../errors/AppError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import { redisClient } from '../../../config/radisConfig';
import generateNumber from '../../../util/generateOTP';

const OTP_EXPIRATION = 5 * 60; // 5 minutes

// 🔐 Login User
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;


  const isExistUser = await User.findOne({ email }).select("+password");
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!isExistUser.verified) {
    throw new AppError(
      StatusCodes.FAILED_DEPENDENCY,
      "Please verify your account, then try to login again"
    );
  }
  const isMatch = await bcrypt.compare(password, isExistUser.password);
  if (!isMatch) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Password is incorrect!");
  }

  // Create Access Token
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in
  );

  // Create Refresh Token
  const refreshToken = jwtHelper.refreshToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_refresh_in
  );

  return {
    accessToken,
    refreshToken
  };
};

// 🚪 Logout - Blacklist both tokens
const logout = async (refreshToken: string, accessToken: string) => {
  // Verify refresh token
  const decoded = jwtHelper.verifyToken(
    refreshToken,
    config.jwt.jwt_secret as Secret
  ) as {
    id: string;
    role: string;
    email: string;
    exp: number;
  };

  if (!decoded?.id || !decoded?.role || !decoded?.email) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token payload");
  }

  // Verify access token
  const accessDecoded = jwtHelper.verifyToken(
    accessToken,
    config.jwt.jwt_secret as Secret
  ) as {
    id: string;
    role: string;
    email: string;
    exp: number;
  };

  if (!accessDecoded?.id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid access token payload");
  }

  // Delete refresh token from Redis
  await redisClient.del(`refreshToken:${decoded.id}`);

  // Blacklist access token in Redis with TTL (until token expires)
  const currentTime = Math.floor(Date.now() / 1000);
  const ttl = accessDecoded.exp - currentTime;

  if (ttl > 0) {
    await redisClient.setEx(`blacklist:${accessToken}`, ttl, 'revoked');
  }

  return null;
};

// 🔄 Get New Access Token from Refresh Token
const getNewAccessToken = async (token: string) => {
  try {
    // 1️⃣ Verify Refresh Token
    const decoded = jwtHelper.verifyToken(
      token,
      config.jwt.jwt_secret as Secret
    ) as {
      id: string;
      role: string;
      email: string;
    };

    if (!decoded?.id || !decoded?.role || !decoded?.email) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token payload");
    }

    // 2️⃣ Check if refresh token exists in Redis
    const storedRefreshToken = await redisClient.get(`refreshToken:${decoded.id}`);

    if (!storedRefreshToken) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "Refresh token not found or expired. Please login again."
      );
    }

    if (storedRefreshToken !== token) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "Invalid refresh token. Please login again."
      );
    }

    // 3️⃣ Check if user actually exists
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "User no longer exists");
    }

    if (!user.verified) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "User account is not verified");
    }

    // 4️⃣ Create a new access token
    const newAccessToken = jwtHelper.createToken(
      { id: user._id.toString(), role: user.role, email: user.email },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string
    );

    // 5️⃣ Create a new refresh token (optional - for rotation)
    const newRefreshToken = jwtHelper.refreshToken(
      { id: user._id.toString(), role: user.role, email: user.email },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_refresh_in as string
    );

    // 6️⃣ Update refresh token in Redis
    const refreshTokenExpiry = 7 * 24 * 60 * 60; // 7 days
    await redisClient.setEx(
      `refreshToken:${user._id}`,
      refreshTokenExpiry,
      newRefreshToken
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };

  } catch (error: any) {
    // Clean up invalid refresh token from Redis
    try {
      const decoded = jwtHelper.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      ) as { id: string };
      if (decoded?.id) {
        await redisClient.del(`refreshToken:${decoded.id}`);
      }
    } catch (e) {
      // Ignore cleanup errors
    }

    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      error.message || "Invalid or expired refresh token"
    );
  }
};

// 📧 Resend OTP
const resendOtpToDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const otp = generateNumber();
  const redisKey = `otp:verify:${email}`;
  await redisClient.setEx(redisKey, OTP_EXPIRATION, otp.toString());

  const values = { otp, email: isExistUser.email };
  const verifyEmailTemplate = emailTemplate.resendOtpTemplate(values);
  await emailHelper.sendEmail(verifyEmailTemplate);

  return { message: 'OTP sent to your email.' };
};

// ✅ Verify Email or OTP
const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, otp } = payload;

  const isExistUser = await User.findOne({ email });
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Redis OTP check (both for verify and forget)
  const redisVerifyKey = `otp:verify:${email}`;
  console.log("redisVerifyKey", redisVerifyKey)


  const redisResetKey = `otp:reset:${email}`;

  let storedOTP = await redisClient.get(redisVerifyKey);
  let redisKeyUsed = redisVerifyKey;

  if (!storedOTP) {
    storedOTP = await redisClient.get(redisResetKey);
    redisKeyUsed = redisResetKey;
  }

  if (!storedOTP) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'OTP expired or not found');
  }

  if (storedOTP !== String(otp)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Wrong OTP');
  }

  // OTP valid, delete from Redis
  await redisClient.del(redisKeyUsed);

  let message;
  let data;

  if (!isExistUser.verified) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      { verified: true, authentication: { otp: null, expireAt: null } }
    );
    message = 'Email verified successfully.';
  } else {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        authentication: {
          isResetPassword: true,
          otp: null,
          expireAt: null,
        },
      }
    );

    const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 5 * 60000),
    });
    message = 'Verification successful. Use this token to reset your password.';
    data = createToken;
  }
  return { data, message };
};

// 🔑 Forget Password (Send OTP)
const forgetPasswordToDB = async (email: string) => {
  if (!email) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email is required");
  }

  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!isExistUser.verified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Please verify your account first"
    );
  }

  const otp = generateNumber();
  const redisKey = `otp:reset:${email}`;
  await redisClient.setEx(redisKey, OTP_EXPIRATION, otp.toString());

  const values = { otp, email: isExistUser.email };
  const forgetPasswordTemplate = emailTemplate.resetPassword(values);
  await emailHelper.sendEmail(forgetPasswordTemplate);

  return { message: 'OTP sent to your email.' };
};

// 🔄 Reset Password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;

  if (!token) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Token is required');
  }

  if (!newPassword || !confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'New password and confirm password are required'
    );
  }

  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired reset token.');
  }

  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication'
  );

  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User doesn't exist!");
  }

  if (!isExistUser?.authentication?.isResetPassword) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to reset the password. Please try 'Forgot Password' again."
    );
  }

  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Token expired. Please try forgot password again.'
    );
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "New password and confirm password don't match!"
    );
  }

  if (newPassword.length < 6) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Password must be at least 6 characters long"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    authentication: { isResetPassword: false },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });

  // Delete the used reset token
  await ResetToken.deleteOne({ _id: isExistToken._id });

  return null;
};

// 🔒 Change Password
const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "All password fields are required"
    );
  }

  const isExistUser = await User.findById(user.id).select('+password');

  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // ✅ FIX HERE
  const isMatch = await isExistUser.isMatchPassword(currentPassword);

  if (!isMatch) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Current password is incorrect.'
    );
  }


  if (currentPassword === newPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'New password must be different from current password.'
    );
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "New password and confirm password don't match."
    );
  }

  if (newPassword.length < 6) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Password must be at least 6 characters long"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    { _id: user.id },
    { password: hashPassword },
    { new: true }
  );
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  resendOtpToDB,
  getNewAccessToken,
  logout
};