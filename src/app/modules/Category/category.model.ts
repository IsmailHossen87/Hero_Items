import mongoose, { model } from "mongoose";
import { ICategory } from "./category.interface";

const categorySchema = new mongoose.Schema<ICategory>({
    image: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        required: true
    },
    categorySlug: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: true
    },

    // ITs increment when create a car
    totalCar: {
        type: Number,
        default: 0
    },
    voteStatus: {
        type: Boolean,
        default: false
    },
    battleCost: {
        type: Number,
        default: 0
    },
    Reward: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


export const Category = model<ICategory>("Category", categorySchema);