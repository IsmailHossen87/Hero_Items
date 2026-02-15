import AppError from "../../../errors/AppError";
import unlinkFile from "../../../shared/unlinkFile";
import { QueryBuilder } from "../../../util/QueryBuilder";
import { Battle } from "../battle/battle.model";
import { Car } from "../Car/car.model";
import { User } from "../user/user.model";
import { searchableFieldsForCategory } from "./category.interface";
import { Category } from "./category.model";
import httpStatus from "http-status-codes";

const createCategory = async (payload: any) => {
    const user = await User.findById(payload.userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    if (user.role !== "ADMIN") {
        throw new AppError(httpStatus.FORBIDDEN, "User is not an admin");
    }
    const category = await Category.create(payload);
    return category
}


const updateCategory = async (id: string, payload: any) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }
    const user = await User.findById(payload.userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.role !== "ADMIN") {
        throw new AppError(httpStatus.FORBIDDEN, "User is not an admin");
    }
    const categoryOwner = await Category.find({ userId: user._id });
    if (!categoryOwner) {
        throw new AppError(httpStatus.NOT_FOUND, "Category owner not found");
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
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.role !== "ADMIN") {
        throw new AppError(httpStatus.FORBIDDEN, "User is not an admin");
    }
    const category = await Category.findById(id);
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }
    const findCategory = await Car.find({ category: id });
    if (findCategory.length > 0) {
        throw new AppError(httpStatus.BAD_REQUEST, `Already Used ${category.name} Category`);
    }
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }
    if (deletedCategory.image) {
        unlinkFile(deletedCategory.image)
    }
    return deletedCategory
}


const getAllCategory = async (query: any) => {
    const { isBattle, ...restQuery } = query;

    let baseQuery = Category.find();

    if (isBattle === 'true') {

        const battleData = await Battle.find({
            categoryId: { $ne: null }
        }).select('categoryId');

        const categoryIds = [
            ...new Set(
                battleData.map(item => item.categoryId?.toString())
            )
        ];

        baseQuery = Category.find({
            _id: { $in: categoryIds }
        });
    }

    // ✅ QueryBuilder এ isBattle পাঠাচ্ছি না
    const queryBuilder = new QueryBuilder(baseQuery, restQuery);

    const categoryQuery = queryBuilder
        .search(searchableFieldsForCategory)
        .filter()
        .sort()
        .limit()
        .paginate();

    const [meta, data] = await Promise.all([
        categoryQuery.getMeta(),
        categoryQuery.build()
    ]);

    if (!data || data.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, 'No categories found');
    }

    return { meta, data };
};


export const CategoryService = {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategory
}