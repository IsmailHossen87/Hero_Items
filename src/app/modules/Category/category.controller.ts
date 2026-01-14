/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import { CategoryService } from './category.service';
import catchAsync from '../../../shared/catchAsync';

// CREATE Category
const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (req.files && "image" in req.files && req.files.image[0]) {
        req.body.image = `/image/${req.files.image[0].filename}`
    }
    const userId = req.user?.id;
    const payload = {
        ...req.body,
        userId
    }

    const category = await CategoryService.createCategory(payload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Category created successfully',
        data: category
    });
});

// UPDATE Category
const updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (req.files && "image" in req.files && req.files.image[0]) {
        req.body.image = `/image/${req.files.image[0].filename}`
    }

    const userId = req.user?.id;
    const payload = {
        ...req.body,
        userId
    }
    const category = await CategoryService.updateCategory(req.params.id, payload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Category updated successfully',
        data: category
    });
});

// DELETE Category
const deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const category = await CategoryService.deleteCategory(req.params.id, userId as string);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Category deleted successfully',
        data: category
    });
});


export const CategoryController = {
    createCategory,
    updateCategory,
    deleteCategory
}
