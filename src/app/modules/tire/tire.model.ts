import mongoose from "mongoose";
import { IPurchase } from "./tire.interface";

// purchase.model.ts
const TireSchema = new mongoose.Schema<IPurchase>({
    userId: {
        type: String,
        required: true
    },
    tireName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    value: {
        type: Number,
        required: true
    }
})

export const Tire = mongoose.model<IPurchase>('Tire', TireSchema)