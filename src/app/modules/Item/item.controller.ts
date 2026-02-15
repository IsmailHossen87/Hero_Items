/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { ItemService } from './item.service';
import { JwtPayload } from 'jsonwebtoken';

// CREATE Category
const createItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (req.files && "image" in req.files && req.files.image[0]) {
        req.body.image = `/image/${req.files.image[0].filename}`;
    }
    const userId = req.user

    const category = await ItemService.createItem(req.body, userId as JwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Item created successfully',
        data: category
    });
});

const getAllItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const ActiveItems = req.query.ActiveItems === "true";
    // console.log(ActiveItems);

    const items = await ItemService.getAllItem(query, ActiveItems as boolean);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Item fetched successfully',
        data: items.data,
        meta: items.meta,
    });
})


const ItemDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const status = req.query.status === "true";
    const user = req.user;
    const item = await ItemService.ItemDetails(id, status as boolean, user as JwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Item purchased successfully',
        data: item
    });
})
// const statusChange = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const { id } = req.params;
//     const status = req.query.status === "true";
//     const user = req.user;
//     const item = await ItemService.statusChange(id, status as boolean, user as JwtPayload);
//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: 'Item status changed successfully',
//         data: item
//     });
// })


const buyItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = req.user;
    const item = await ItemService.buyItem(id, user as JwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Item fetched successfully',
        data: item
    });
})

const buyItemHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const user = req.user;
    const item = await ItemService.buyItemHistory(user as JwtPayload, query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Transaction history fetched successfully',
        data: item.data,
        meta: item.meta,
    });
})

export const ItemController = {
    createItem,
    getAllItem,
    ItemDetails,
    buyItem,
    buyItemHistory
}