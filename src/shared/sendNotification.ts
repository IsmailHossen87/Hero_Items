import { firebaseAdmin } from "../app/middlewares/firebaseAdmin";

export const sendFirebaseNotification = async (
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
    imageUrl?: string
) => {
    if (!token) return;

    await firebaseAdmin.messaging().send({
        token,
        notification: { title, body, imageUrl },
        data,
    });
};
