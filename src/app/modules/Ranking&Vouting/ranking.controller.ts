/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { RankingService } from './ranking.service';
import { JwtPayload } from 'jsonwebtoken';

// CREATE Category
const giveVote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id

    console.log("HELLOW _bangladesh")
    const category = await RankingService.giveVote(userId as string, req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Vote given successfully',
        data: category
    });
});

// vut history
const getVutHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    const category = await RankingService.vuterHistory(req.params.id, user as JwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Vut history fetched successfully',
        data: category
    });
});

// 🈯🈯🈯
const resetVote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload
    const category = await RankingService.resetVote(req.params.id, user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Vote reset successfully',
        data: category
    });
});

export const RankingController = { giveVote, getVutHistory, resetVote }