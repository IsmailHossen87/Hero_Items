import Notification from "./notification.model";

export const saveNotification = async (payload: any) => {
    const result = await Notification.create(payload)
    return result
};