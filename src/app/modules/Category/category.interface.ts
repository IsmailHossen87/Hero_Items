import { Types } from "mongoose"

export const searchableFieldsForCategory = [
    "name", "categorySlug"
];


export interface ICategory {
    image: string,
    userId: Types.ObjectId,
    name: string,
    categorySlug: string,
    description: string,
    isDeleted: boolean,
    voteStatus: boolean,
    credit: number,
    totalCar: number,
    createdAt: Date,
    updatedAt: Date,
    _id: string
}


