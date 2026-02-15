import { Types } from "mongoose";
export const searchableFieldsItem = ["itemName", "itemDescription"];
export interface IItem {
    userId: Types.ObjectId
    buyerId: Types.ObjectId[];
    itemName: string;
    itemDescription: string;
    pointCost: number;
    discountCost: number;
    image: string;
    categoryType: string;
    userType: string;
    totalItem: number;
    volume: string;
    formula: string;
    status: 'Active' | 'Inactive';
}