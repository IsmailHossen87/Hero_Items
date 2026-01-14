import { Types } from "mongoose"

export interface ICategory {
    image: string,
    userId: Types.ObjectId,
    name: string,
    categorySlug: string,
    description: string,
    isDeleted: boolean,
    voteStatus: boolean,
    battleCost: number, //COINS
    Reward: number,
    totalCar: number,
    createdAt: Date,
    updatedAt: Date,
    _id: string
}