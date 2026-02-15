import mongoose, { Schema } from "mongoose";
import { ITransaction } from "./transaction.interface";

// transaction.model.ts
const transactionSchema = new mongoose.Schema<ITransaction>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number },
    totalCoin: { type: Number },
    tireId: { type: Schema.Types.ObjectId, ref: 'Tire' },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
    currency: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);