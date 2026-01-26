import mongoose from "mongoose";
import { NOTIFICATION_TYPE } from "./notification.interface";
import { sendFirebaseNotification } from "../../../shared/sendNotification";

// notification.model.ts
const notificationSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true, },
    carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true, },
    title: { type: String, required: true, },
    body: { type: String, required: true, },
    read: { type: Boolean, default: false, },
    notificationType: { type: String, enum: ['NOTIFICATION', 'MESSAGE'] },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPE) },
    status: { type: String, enum: ['SUCCESS', 'REJECTED'], default: 'SUCCESS', },
})

const Notification = mongoose.model("Notification", notificationSchema)


type FirebaseNotificationPayload = {
    fcmToken?: string;
    title: string;
    body: string;
    type: string;
    carId: string;
    senderId: string;
    receiverId: string;
    image?: string;
};

export const sendReaujableNotification = async ({
    fcmToken, title, body, type, carId, senderId, receiverId, image, }: FirebaseNotificationPayload) => {
    if (!fcmToken) return;

    await sendFirebaseNotification(fcmToken, title, body,
        {
            type,
            carId,
            senderId,
            receiverId,
            status: "SUCCESS",
        },
        image
    );
};


export default Notification