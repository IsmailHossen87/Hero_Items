import mongoose, { model, Schema } from "mongoose";
import { ICar, IStatus } from "./car.interface";

const CarSchema = new mongoose.Schema<ICar>({
    images: [{ type: String, required: true }],
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    make: { type: String },
    year: { type: Date },
    status: { type: String, enum: Object.values(IStatus), default: IStatus.PENDING },
    model: { type: String },
    categoryName: { type: String },
    battleCost: { type: Number, default: 0 },
    Reward: { type: Number, default: 0 },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    isDeleted: { type: Boolean },
    ranking: { type: Number, default: 0 },
    votes: { type: Number, default: 0 },
    Top: { type: Number, default: 0 },
}, { versionKey: false, timestamps: true })


export const Car = model<ICar>("Car", CarSchema);