import { Request, Response, NextFunction } from 'express';

export const parseFormDataMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body?.data) {
      const parsed = JSON.parse(req.body.data);
      req.body = { ...parsed };
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in form-data "data" field',
    });
  }
};
