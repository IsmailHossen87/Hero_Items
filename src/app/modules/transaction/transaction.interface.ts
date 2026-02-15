import { Types } from "mongoose";

// transaction.interface.ts
export interface ITransaction {
    _id: string;
    userId: Types.ObjectId;
    tireId: Types.ObjectId;
    itemId: Types.ObjectId;
    amount: number;
    totalCoin: number;
    currency: string;
    type: string;
    paymentMethod: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

