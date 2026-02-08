import { Types } from "mongoose";
export enum IStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

export const searchableFields = [
    "manufacturer",
    "model",
    "status",
    "category",
    "userId"
];

export interface ICar {
    year: string,
    manufacturer: string,
    modelName: string,
    modelId: Types.ObjectId;
    category: Types.ObjectId;
    images: string[];
    userId: Types.ObjectId;
    isDeleted: boolean,
    status: IStatus
    ranking: number,
    credit: number,
    modelDescription: string,
    earnPoints: number,
    votes: number,
    Top: number,
    createdAt: Date;
    updatedAt: Date;
    _id: string;
    categoryName: string;
}