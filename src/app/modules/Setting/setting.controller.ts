/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { JwtPayload } from 'jsonwebtoken';
import { SettingService } from './setting.service';

// CREATE Category
const globalSettingCreate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (req.files && "image" in req.files && req.files.image[0]) {
        req.body.image = `/image/${req.files.image[0].filename}`;
    }


    const user = req.user

    console.log("payload", req.body)

    const category = await SettingService.globalSettingCreate(req.body, user as JwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Item created successfully',
        data: category
    });
});


const termsConditionCreate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    const category = await SettingService.termsConditionCreate(req.body, user as JwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Item created successfully',
        data: category
    });
})

const privacyPolicyCreate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    const category = await SettingService.privacyPolicyCreate(req.body, user as JwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Item created successfully',
        data: category
    });
})


const getSetting = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log("req.param.key", req.params.key)
    const category = await SettingService.getAllSetting(req.params.key);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Setting fetched successfully',
        data: category
    });
})


export const SettingController = {
    globalSettingCreate,
    termsConditionCreate,
    privacyPolicyCreate,
    getSetting
}