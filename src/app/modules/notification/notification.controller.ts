// notification.controller.ts
// notification.controller.ts
import { NextFunction, Request, Response } from "express"
import { NotificationService } from "./notification.service"
import catchAsync from "../../../shared/catchAsync"



// user.controller.ts
const sendNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await NotificationService.sendNotification(req.body)

    res.status(200).json({
        success: true,
        message: "User created successfully",
        data: result
    })
})


const getAllNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query
    const result = await NotificationService.getAllNotification(query)

    res.status(200).json({
        success: true,
        message: "User created successfully",
        data: result
    })
})

export const NotificationController = {
    sendNotification,
    getAllNotification
}