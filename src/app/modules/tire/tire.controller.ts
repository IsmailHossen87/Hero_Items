import { NextFunction, Request, Response } from "express"
import catchAsync from "../../../shared/catchAsync"
import { TireService } from "./tire.service"



// user.controller.ts
const createTire = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    console.log(req.body)
    const result = await TireService.createTire(userId, req.body)
    res.status(200).json({
        success: true,
        message: "Purchase created successfully",
        data: result
    })
})


const getAllTire = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query
    const result = await TireService.getAllTire(query)
    res.status(200).json({
        success: true,
        message: "Tire fetched successfully",
        meta: result.meta,
        data: result.data
    })
})


const getTireById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const { id } = req.params
    const result = await TireService.getTireById(userId as string, id)
    res.status(200).json({
        success: true,
        message: "Tire fetched successfully",
        data: result
    })
})

const updateTire = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const { id } = req.params
    const result = await TireService.updateTire(userId as string, id, req.body)
    res.status(200).json({
        success: true,
        message: "Tire updated successfully",
        data: result
    })
})

const deleteTire = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const { id } = req.params
    const result = await TireService.deleteTire(userId as string, id)
    res.status(200).json({
        success: true,
        message: "Tire deleted successfully",
        data: result
    })
})


export const PurchaseController = {
    createTire,
    getAllTire,
    getTireById,
    updateTire,
    deleteTire,
}