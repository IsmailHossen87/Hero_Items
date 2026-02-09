import { Types } from "mongoose";
export const searchableFieldsItem = ["itemName", "itemDescription"];
export interface IItem {
    userId: Types.ObjectId
    buyerId: Types.ObjectId[];
    itemName: String;
    itemDescription: String;
    pointCost: Number;
    discountCost: Number;
    image: String;
    categoryType: String;
    userType: String;
    totalItem: Number;
    volume: String;
    formula: String;
    status: 'Active' | 'Inactive';
}