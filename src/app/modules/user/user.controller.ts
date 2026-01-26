/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { JwtPayload } from 'jsonwebtoken';


// CREATE USER
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;

    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: null,
    });
  }
);

// GET USER PROFILE
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const { userId } = req.query;
  const result = await UserService.getUserProfileFromDB(user, userId as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: { ...result },
  });
});

// GET ALL USER
const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUser();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users data retrieved successfully',
    data: result,
  });
});


//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    console.log(req.files)
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
      ...req.body,
    };

    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

// FOLLOW USER
const followUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const { id } = req.params;
    const result = await UserService.followUser(user, id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User followed successfully',
      data: { follow: result.isFollowing },
    });
  }
);


// Preview
const dailyPreview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await UserService.previewDailyReward(user.id);

  sendResponse(res, {
    success: result.success,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: { preview: result.preview }
  });
});

// Claim
const dailyClaim = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await UserService.claimDailyReward(user.id);

  sendResponse(res, {
    success: result.success,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: { coins: result.coins }
  });
});


const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const { id } = req.query;
  const { password } = req.body
  console.log(req.query)
  const result = await UserService.deleteUser(
    user,
    typeof id === "string" ? id : undefined,
    typeof password === "string" ? password : undefined
  );


  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User deleted successfully',
    data: result,
  });
});


export const UserController = { createUser, getUserProfile, updateProfile, getAllUser, followUser, dailyClaim, dailyPreview, deleteUser };
