import { Types } from "mongoose";
export enum NOTIFICATION_TYPE {
    VOTE = 'VOTE',
    CREATE_CAR = 'CREATE_CAR',
    BUY_ITEM = 'BUY_ITEM',
    CAR_APPROVED = 'CAR_APPROVED',
}

// notification.interface.ts
export interface INotification {
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    itemId?: Types.ObjectId;
    title?: string;
    body: string;
    read: boolean;
    notificationType?: 'NOTIFICATION' | 'MESSAGE';
    type?: NOTIFICATION_TYPE;
    status?: 'SUCCESS' | 'REJECTED';
}