import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: string,
      email: string
    }

    interface Request {
      user?: JwtPayload;
    }
  }
}
