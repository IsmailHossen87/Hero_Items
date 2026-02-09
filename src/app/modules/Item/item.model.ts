import mongoose, { model, Schema } from "mongoose";
import { IItem } from "./item.interface";
import { IStatus } from "../Car/car.interface";

const ItemSchema = new mongoose.Schema<IItem>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    buyerId: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        default: []
    },
    itemName: {
        type: String,
        required: true
    },
    itemDescription: {
        type: String,
        required: true
    },
    pointCost: {
        type: Number,
        required: true
    },
    discountCost: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    categoryType: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    totalItem: {
        type: Number,
        required: true
    },
    volume: {
        type: String,
        required: true
    },
    formula: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true, versionKey: false })





export const Item = model("Item", ItemSchema);