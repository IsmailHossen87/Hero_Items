import mongoose from "mongoose";
import { INotification, IReferenceType, NOTIFICATION_TYPE } from "./notification.interface";
import { sendFirebaseNotification } from "../../../shared/sendNotification";

// notification.model.ts
const notificationSchema = new mongoose.Schema<INotification>({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: "referenceType" },
    referenceType: { type: String, enum: Object.values(IReferenceType) },
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
    carId?: string;
    itemId?: string;
    senderId: string;
    receiverId: string;
    image?: string;
};

export const sendReaujableNotification = async ({
    fcmToken,
    title,
    body,
    type,
    carId,
    itemId,
    senderId,
    receiverId,
    image,
}: FirebaseNotificationPayload) => {

    if (!fcmToken) return;

    const finalItemId = itemId ?? carId;

    if (!finalItemId) {
        console.warn("Notification skipped: no itemId or carId provided");
        return;
    }

    // ✅ image valid URL না হলে বাদ দাও
    const validImage =
        image && image.startsWith("http") ? image : undefined;

    try {
        await sendFirebaseNotification(
            fcmToken,
            title,
            body,
            {
                type,
                id: finalItemId,
                senderId,
                receiverId,
                status: "SUCCESS",
            },
            validImage
        );

        // ✅ SUCCESS console
        console.log("✅ Notification sent successfully", {
            receiverId,
            type,
            id: finalItemId,
        });

    } catch (error) {
        console.error("❌ Notification send failed", error);
    }
};



export default Notification