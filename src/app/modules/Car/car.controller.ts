/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

import catchAsync from '../../../shared/catchAsync';
import { CarService } from './car.service';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
import { syncUserRank } from '../user/syncUserRank';

// CREATE Category
const createCar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = getMultipleFilesPath(req.files, "image")
    const userId = req.user?.id

    const payload = {
        ...req.body,
        userId,
        images: filePath
    }

    const category = await CarService.createCar(payload);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Car created successfully',
        data: category
    });
});

// GET ALL Cars
const getAllCars = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query

    const cars = await CarService.getAllCars(query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Cars retrieved successfully',
        meta: cars.meta,
        data: cars.data
    });
});


// SPECIFIC Category Cars
const getSpecificCategoryCars = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query
    const categoryId = req.params.id
    const cars = await CarService.SpecificCategoryCars(query, categoryId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Cars retrieved successfully',
        meta: cars.meta,
        data: cars.data
    });
})

// GET MY Cars
const getMyCars = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query
    const userId = req.user?.id as string
    const cars = await CarService.myCars(query, userId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Cars retrieved successfully',
        data: { ...cars }
    });
});

// Car Details
const carDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const carId = req.params.id
    const car = await CarService.carDetails(carId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Cars retrieved successfully',
        data: car
    });
});

// Change Status
const changeStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const carId = req.params.id
    const userId = req.user?.id as string
    const car = await CarService.changeStatus(carId, userId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Cars retrieved successfully',
        data: car
    });
});
export const carController = { createCar, getAllCars, getMyCars, carDetails, changeStatus, getSpecificCategoryCars }