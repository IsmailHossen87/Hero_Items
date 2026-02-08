import { Types } from "mongoose";

// transaction.interface.ts
export interface ITransaction {
    _id: string;
    userId: Types.ObjectId;
    tireId: Types.ObjectId;
    amount: number;
    currency: string;
    type: string;
    paymentMethod: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

