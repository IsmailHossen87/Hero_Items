import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createPaymentService } from "./PaymentService";

const buyMoneyCredits = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const paymentSession = await createPaymentService.createPaymentIntent(req.params.id, userId)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Redirect to payment",
    data: paymentSession
  });
});

const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment success",
  });
});

const paymentCancel = catchAsync(async (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment cancel",
  });
});




export const PaymentController = { buyMoneyCredits, paymentSuccess, paymentCancel };