import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import { redisClient } from '../../config/radisConfig';
import AppError from '../../errors/AppError';


/**
 * Middleware to check if the access token has been blacklisted (revoked during logout)
 * This should be applied AFTER your auth middleware that verifies the token
 */
export const checkTokenBlacklist = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        // Check if token is blacklisted in Redis
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);

        if (isBlacklisted) {
            throw new AppError(
                StatusCodes.UNAUTHORIZED,
                'Token has been revoked. Please login again.'
            );
        }

        next();
    }
);