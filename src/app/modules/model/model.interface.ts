import { Types } from "mongoose";


export const searchModel = ["year", "modelName", "manufacturer"]
// model.interface.ts
export interface IModel {
    year: string,
    userId: Types.ObjectId,
    modelName: string,
    manufacturer: string,
    description: string,
    categoryId: Types.ObjectId,
}