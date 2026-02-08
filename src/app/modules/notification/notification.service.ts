import { USER_ROLES } from "../../../enums/user";
import AppError from "../../../errors/AppError"
import { QueryBuilder } from "../../../util/QueryBuilder"
import Notification from "./notification.model"
import httpStatus from "http-status-codes";

// notification.service.ts
const sendNotification = async (payload: any) => {
    const result = await Notification.create(payload)
    return result
}



const getAllNotification = async (query: any, user: any) => {
    const queryBuilder = new QueryBuilder(Notification.find({ receiverId: user.id }).lean().sort({ createdAt: -1 }), query)

    const result = await queryBuilder.
        search(['title'])
        .filter()
        .sort()
        .limit()
        .paginate()

    const [meta, data] = await Promise.all([
        result.getMeta(),
        result.build()
    ])
    const unreadNotification = await Notification.countDocuments({ receiverId: user.id, read: false })

    if (USER_ROLES.USER || USER_ROLES.ADMIN) {
        const notificationIds = await data.filter((item: any) => item.read === false)
            .map((data: any) => data._id)

        if (notificationIds.length > 0) {
            await Notification.updateMany(
                { _id: { $in: notificationIds } },
                { $set: { read: true } }
            )
        }
    }
    return { meta, data, unreadNotification }
}


// DELETE
const deleteNotification = async (id: string) => {
    const notification = await Notification.findById(id)
    if (!notification) {
        throw new AppError(httpStatus.NOT_FOUND, "Notification not found")
    }
    const result = await Notification.findByIdAndDelete(id)
    return result
}

export const NotificationService = {
    sendNotification,
    getAllNotification,
    deleteNotification
}