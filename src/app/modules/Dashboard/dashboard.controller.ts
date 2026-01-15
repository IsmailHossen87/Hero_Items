/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { DashboardService } from './dashboard.service';
import { JwtPayload } from 'jsonwebtoken';


// CREATE Category
const getDashboardData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user
    const query = req.query
    const category = await DashboardService.getDashboardData(userId as JwtPayload, query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Vote given successfully',
        data: category
    });
});


export const DashboardController = {
    getDashboardData
}