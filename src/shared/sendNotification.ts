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
        data: { title, body, image: imageUrl || "" },
    });
};
