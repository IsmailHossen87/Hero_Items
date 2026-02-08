import mongoose, { model, Schema } from "mongoose";
import { ICar, IStatus } from "./car.interface";

const CarSchema = new mongoose.Schema<ICar>({
    images: [{ type: String, required: true }],
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    modelId: { type: Schema.Types.ObjectId, ref: "Model", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    manufacturer: { type: String },
    year: { type: String },
    status: { type: String, enum: Object.values(IStatus), default: IStatus.PENDING },
    modelName: { type: String },
    categoryName: { type: String },
    modelDescription: { type: String },
    credit: { type: Number, default: 0 },
    earnPoints: { type: Number, default: 0 },
    ranking: { type: Number, default: 0 },
    votes: { type: Number, default: 0 },
    Top: { type: Number, default: 0 },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    isDeleted: { type: Boolean },
}, { versionKey: false, timestamps: true })


export const Car = model<ICar>("Car", CarSchema);