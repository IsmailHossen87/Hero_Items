import AppError from "../../../errors/AppError";
import unlinkFile from "../../../shared/unlinkFile";
import { QueryBuilder } from "../../../util/QueryBuilder";
import { User } from "../user/user.model";
import { searchableFieldsForCategory } from "./category.interface";
import { Category } from "./category.model";
import httpStatus from "http-status-codes";

const createCategory = async (payload: any) => {
    const user = await User.findById(payload.userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role !== "ADMIN") {
        throw new Error("User is not an admin");
    }
    const category = await Category.create(payload);
    return category
}


const updateCategory = async (id: string, payload: any) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new Error("Category not found");
    }
    const user = await User.findById(payload.userId);
    if (!user) {
        throw new Error("User not found");
    }

    if (user.role !== "ADMIN") {
        throw new Error("User is not an admin");
    }
    const categoryOwner = await Category.find({ userId: user._id });
    if (!categoryOwner) {
        throw new Error("Category owner not found");
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, payload, {
        new: true
    });

    if (payload.image && category.image) {
        unlinkFile(category.image)
    }
    return updatedCategory
}
// Delete
const deleteCategory = async (id: string, userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    if (user.role !== "ADMIN") {
        throw new Error("User is not an admin");
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        throw new Error("Category not found");
    }
    if (category.image) {
        unlinkFile(category.image)
    }
    return category
}


const getAllCategory = async (query: any) => {
    const baseQuery = Category.find();
    const queryBilder = new QueryBuilder(baseQuery, query);

    const car = await queryBilder.search(searchableFieldsForCategory)
        .filter()
        .sort()
        .limit()
        .paginate();

    const [meta, data] = await Promise.all([
        car.getMeta(),
        car.build()
    ])
    if (!data || data.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, 'No categories found');
    }
    return { meta, data }
}




export const CategoryService = {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategory
}