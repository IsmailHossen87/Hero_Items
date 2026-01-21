import mongoose, { model, Types } from "mongoose";

// model.model.ts
const modelSchema = new mongoose.Schema({
    year: {
        type: String,
        required: true
    },
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    modelName: {
        type: String,
        required: true
    },
    manufacturer: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    categoryId: {
        type: Types.ObjectId,
        ref: "Category",
        required: true
    }
})

export const Model = model("Model", modelSchema)