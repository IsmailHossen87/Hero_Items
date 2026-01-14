import { Response } from 'express';

interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  const responseData: IApiResponse<T> = {
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta,
  };

  res.status(data.statusCode).json(responseData);
};

export default sendResponse;



