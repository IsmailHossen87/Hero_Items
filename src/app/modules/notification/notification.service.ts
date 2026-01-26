import { QueryBuilder } from "../../../util/QueryBuilder"
import Notification from "./notification.model"

// notification.service.ts
const sendNotification = async (payload: any) => {
    const result = await Notification.create(payload)

}



const getAllNotification = async (query: any) => {
    const queryBuilder = new QueryBuilder(Notification.find(), query)
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

    return { meta, data }
}
export const NotificationService = {
    sendNotification,
    getAllNotification
}