// battle.controller.ts
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { battleService } from './battle.service';


// CREATE Category
const RandomBattle = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const category = await battleService.generateDailyBattles()

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Car created successfully',
        data: category
    });
});
const closeDailyBattles = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const category = await battleService.closeDailyBattles()

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Car created successfully',
        data: category
    });
});


export const battleController = {
    RandomBattle,
    closeDailyBattles
}