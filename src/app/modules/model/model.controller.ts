// model.controlle/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';

import { JwtPayload } from 'jsonwebtoken';
import { ModelService } from './model.service';

// CREATE Category
const createModel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user as JwtPayload


    const model = await ModelService.createModel(userId, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Model created successfully',
        data: model
    });
});

// GET Models
const getModels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query

    const result = await ModelService.getModels(query)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Models fetched successfully',
        meta: result.meta,
        data: result.data
    });
})


export const ModelController = { createModel, getModels }