import { JwtPayload } from "jsonwebtoken"
import { IModel, searchModel } from "./model.interface"
import { USER_ROLES } from "../../../enums/user"
import AppError from "../../../errors/AppError"
import { StatusCodes } from 'http-status-codes';
import { Model } from "./model.model";
import { Category } from "../Category/category.model";
import { QueryBuilder } from "../../../util/QueryBuilder";


// model.service.ts
const createModel = async (user: JwtPayload, modelData: IModel) => {
    if (user.role !== USER_ROLES.ADMIN) {
        throw new AppError(StatusCodes.BAD_REQUEST, "You are not authorized to create a model")
    }
    const category = await Category.findById(modelData.categoryId)
    if (!category) {
        throw new AppError(StatusCodes.NOT_FOUND, "Category not found")
    }
    const model = await Model.create({ ...modelData, categoryId: category._id, userId: user.id })
    return model
}


const getModels = async (query: any) => {
    const models = Model.find()
    const queryBuilder = new QueryBuilder(models, query)
    const result = await queryBuilder.search(searchModel).filter().sort().paginate()

    const [meta, data] = await Promise.all([
        result.getMeta(),
        result.build()
    ])
    if (!data || data.length === 0) {
        throw new AppError(StatusCodes.NOT_FOUND, 'No models found');
    }
    return { meta, data }
}


export const ModelService = { createModel, getModels }