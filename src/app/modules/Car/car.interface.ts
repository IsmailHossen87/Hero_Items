import { Types } from "mongoose";
export enum IStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

export const searchableFields = [
    "make",
    "model",
    "status"
];

export interface ICar {
    year: Date,
    make: string,
    model: string,
    category: Types.ObjectId;
    images: string[];
    userId: Types.ObjectId;
    isDeleted: boolean,
    status: IStatus
    ranking: number,
    battleCost: number,
    Reward: number,
    votes: number,
    createdAt: Date;
    updatedAt: Date;
    _id: string;
    categoryName: string;
}