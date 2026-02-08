import mongoose, { model } from "mongoose";
import { ICategory } from "./category.interface";
import { Car } from "../Car/car.model";

const categorySchema = new mongoose.Schema<ICategory>({
    image: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    categorySlug: { type: String },
    isDeleted: { type: Boolean, default: false },
    description: { type: String, required: true },
    voteStatus: { type: Boolean, default: true },
    credit: { type: Number, default: 0 },
    totalCar: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// categorySchema.pre("save", function (next) {
//     this.name = this.name.replace(/\s+/g, "") + "Car";
//     this.categorySlug = this.name.toLowerCase().replace(/\s+/g, "-") + "-car";
//     next();
// });

categorySchema.post("save", syncCars);
categorySchema.post("findOneAndUpdate", syncCars);

async function syncCars(doc: any) {
    if (!doc) return;
    await Car.updateMany(
        { category: doc._id },
        {
            credit: doc.credit ?? 0,
        }
    );
}


export const Category = model<ICategory>("Category", categorySchema);