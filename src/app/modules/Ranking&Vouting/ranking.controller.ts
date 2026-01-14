/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { RankingService } from './ranking.service';

// CREATE Category
const giveVote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id
    const category = await RankingService.giveVote(userId as string, req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Vote given successfully',
        data: category
    });
});



export const RankingController = { giveVote }