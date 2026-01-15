import { JwtPayload } from "jsonwebtoken"
import { Setting } from "./setting.model"
import { USER_ROLES } from "../../../enums/user"
import AppError from "../../../errors/AppError"
import httpStatus from "http-status-codes"
import { ISettingType } from "./setting.interface"
import unlinkFile from "../../../shared/unlinkFile"

const globalSettingCreate = async (body: any, user: JwtPayload) => {
    if (user.role !== USER_ROLES.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to create global setting")
    }

    let globalSetting = await Setting.findOne({ globalSettingType: ISettingType.globalSetting })

    if (globalSetting) {
        globalSetting = await Setting.findOneAndUpdate({ globalSettingType: ISettingType.globalSetting }, body, { new: true })

        if (body.image && globalSetting?.image) {
            unlinkFile(globalSetting.image)
        }
    }
    else {
        globalSetting = await Setting.create(body)
    }
    return globalSetting
}


const termsConditionCreate = async (body: any, user: JwtPayload) => {
    if (user.role !== USER_ROLES.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to create terms condition")
    }
    let termsCondition = await Setting.findOne({ globalSettingType: ISettingType.termsCondition })
    if (termsCondition) {
        termsCondition = await Setting.findOneAndUpdate({ globalSettingType: ISettingType.termsCondition }, body, { new: true })
    }
    else {
        termsCondition = await Setting.create({ ...body, globalSettingType: ISettingType.termsCondition })
    }
    return termsCondition
}

const privacyPolicyCreate = async (body: any, user: JwtPayload) => {
    if (user.role !== USER_ROLES.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to create privacy policy")
    }
    let privacyPolicy = await Setting.findOne({ globalSettingType: ISettingType.privacyPolicy })
    if (privacyPolicy) {
        privacyPolicy = await Setting.findOneAndUpdate({ globalSettingType: ISettingType.privacyPolicy }, body, { new: true })
    }
    else {
        privacyPolicy = await Setting.create({ ...body, globalSettingType: ISettingType.privacyPolicy })
    }
    return privacyPolicy
}

const getAllSetting = async (key: string) => {
    const setting = await Setting.find({ globalSettingType: key })
    if (!setting) {
        throw new AppError(httpStatus.NOT_FOUND, "Setting not found")
    }
    return setting
}

export const SettingService = {
    globalSettingCreate,
    termsConditionCreate,
    privacyPolicyCreate,
    getAllSetting
}