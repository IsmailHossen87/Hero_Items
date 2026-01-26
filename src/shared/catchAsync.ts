import { NextFunction, Request, RequestHandler, Response } from 'express';

const catchAsync = (fn: RequestHandler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default catchAsync;



//example : catchAsycn
// const fn1 = (a) => a; 


 //fnc example : fn

// const fn2 = (b) => {  
//   try {
//     return fn1
//   } catch (error) {
//     throw new Error(error);
    
//   }
// };

// const fnOne =fn2(throw new Error("");
// );

// const retRes = fnOne(10);
// console.log(retRes)