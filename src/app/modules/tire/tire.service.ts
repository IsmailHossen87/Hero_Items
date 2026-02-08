import { USER_ROLES } from "../../../enums/user"
import AppError from "../../../errors/AppError"
import { QueryBuilder } from "../../../util/QueryBuilder"
import { User } from "../user/user.model"
import { Tire } from "./tire.model"
import httpStatus from "http-status-codes"

// purchase.service.ts
const createTire = async (userId: string, body: any) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }
    if (user.role !== USER_ROLES.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to create purchase")
    }
    const result = await Tire.create({ ...body, userId })
    return result
}


const getAllTire = async (userId: string, query: any) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }
    if (user.role !== USER_ROLES.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to get purchase")
    }
    const queryBuilder = new QueryBuilder(Tire.find(), query)
        .search(['tireName type'])
        .filter()
        .sort()
        .paginate()
        .fields()

    const [meta, data] = await Promise.all([
        queryBuilder.getMeta(),
        queryBuilder.build()
    ])
    if (!data || data.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, 'No tire found');
    }
    return { meta, data }
}

const getTireById = async (userId: string, id: string) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }
    if (user.role !== USER_ROLES.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to get purchase")
    }
    const result = await Tire.findById(id)
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Tire not found")
    }
    return result
}

const updateTire = async (userId: string, id: string, body: any) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }
    if (user.role !== USER_ROLES.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update purchase")
    }
    const result = await Tire.findByIdAndUpdate(id, body, { new: true })
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Tire not found")
    }
    return result
}

const deleteTire = async (userId: string, id: string) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }
    if (user.role !== USER_ROLES.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to delete purchase")
    }
    const result = await Tire.findByIdAndDelete(id)
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Tire not found")
    }
    return result
}

export const TireService = {
    createTire,
    getAllTire,
    getTireById,
    updateTire,
    deleteTire
}