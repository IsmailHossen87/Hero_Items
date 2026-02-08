import mongoose, { Schema } from "mongoose";
import { ITransaction } from "./transaction.interface";

// transaction.model.ts
const transactionSchema = new mongoose.Schema<ITransaction>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: {
        type: Number,
        required: true
    },
    tireId: { type: Schema.Types.ObjectId, ref: 'Tire', required: true },
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