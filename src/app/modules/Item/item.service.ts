import { JwtPayload } from "jsonwebtoken";
import { Item } from "./item.model";
import { USER_ROLES } from "../../../enums/user";
import mongoose, { Query } from "mongoose";
import { QueryBuilder } from "../../../util/QueryBuilder";
import { searchableFieldsItem } from "./item.interface";
import { User } from "../user/user.model";
import AppError from "../../../errors/AppError";
import httpStatus from "http-status-codes";
import { emailHelper } from "../../../helpers/emailHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import generateNumber from "../../../util/generateOTP";
import { INotification, IReferenceType, NOTIFICATION_TYPE } from "../notification/notification.interface";
import { saveNotification } from "../notification/sharedNotification";
import { sendReaujableNotification } from "../notification/notification.model";
import { Transaction } from "../transaction/transaction.model";


export interface IItemPurchase {
    name: string;
    email: string;
    itemName: string;
    image: string;
    itemPrice: number;
    purchaseDate: string;
}
export interface ItemPurchaseAdmin {
    buyerName: string;
    buyerEmail: string;
    itemName: string;
    image: string;
    itemPrice: number;
    purchaseDate: string;
}

const createItem = async (data: any, user: JwtPayload) => {
    if (USER_ROLES.ADMIN !== user.role) {
        throw new Error("You are not authorized to create item");
    }
    const result = await Item.create({ userId: user.id, ...data });
    return result;
}


const getAllItem = async (query: any, allItem?: boolean) => {

    const queryBuilder = new QueryBuilder(Item.find().lean(), query);
    const AllItemsLength = await Item.countDocuments();
    const avtiveItemsLength = await Item.countDocuments({ status: "Active" });
    const inactiveItemsLength = await Item.countDocuments({ status: "Inactive" });

    const result = queryBuilder
        .search(searchableFieldsItem)
        .filter()
        .dateRange()
        .sort()
        .paginate();

    const [meta, data] = await Promise.all([
        result.getMeta(),
        result.build(),
    ]);

    // return { ...meta, AllItemsLength, avtiveItemsLength, inactiveItemsLength, data };
    return {
        meta: { ...meta, AllItemsLength, avtiveItemsLength, inactiveItemsLength }, data
    };

};



const ItemDetails = async (
    id: string,
    ActiveStatus?: boolean,
    user?: JwtPayload
) => {
    const item = await Item.findById(id);
    if (!item) {
        throw new Error("Item not found");
    }
    const visitor = await User.findById(user?.id);
    if (!visitor) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // শুধুমাত্র যখন ActiveStatus === true তখনই toggle হবে
    if (ActiveStatus === true) {
        if (!user || user.role !== USER_ROLES.ADMIN) {
            throw new Error("You are not authorized to toggle item status");
        }

        item.status = item.status === "Active" ? "Inactive" : "Active";
        await item.save();
    }

    return { ...item.toObject(), balance: visitor.coin };
};


// BuyItem
const buyItem = async (id: string, user: JwtPayload) => {
    const session = await mongoose.startSession();

    try {
        // 1️⃣ Validate Item
        const item = await Item.findById(id).session(session);
        if (!item) {
            throw new AppError(httpStatus.NOT_FOUND, "Item not found");
        }

        if (item.status !== "Active") {
            throw new AppError(httpStatus.BAD_REQUEST, "Item is not active");
        }

        // 2️⃣ Validate User
        const userInfo = await User.findById(user.id).session(session);
        if (!userInfo) throw new AppError(httpStatus.NOT_FOUND, "User not found");

        // 3️⃣ Check Authorization
        if (item.userId === userInfo.id) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You cannot buy your own item"
            );
        }

        // 4️⃣ Check Balance
        const pointCost = Number(item.pointCost);
        const userCoin = Number(userInfo.coin);

        if (userCoin < pointCost) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Insufficient coins. You need ${pointCost} coins.`
            );
        }

        // 5️⃣ Process Purchase
        userInfo.coin -= pointCost;
        item.buyerId.push(user.id);

        await Promise.all([
            userInfo.save({ session }),
            item.save({ session })
        ]);

        await Transaction.create({
            userId: user.id,
            itemId: item.id,
            totalCoin: pointCost,
            type: "redeem",
            currency: "BDT",
            paymentMethod: "Coin",
            status: "success",
        })
        sendReaujableNotification({
            fcmToken: userInfo.fcmToken,
            title: "Item Purchased",
            body: "You have purchased an item",
            type: NOTIFICATION_TYPE.BUY_ITEM,
            carId: "",
            senderId: user.id,
            receiverId: userInfo.id,
            image: item?.image as string,
        })

        const customerEmailData = {
            name: userInfo.name,
            email: userInfo.email,
            itemName: item.itemName,
            image: item.image,
            itemPrice: pointCost
        } as IItemPurchase;

        // const adminEmailData = {
        //     buyerName: userInfo.name,
        //     buyerEmail: userInfo.email,
        //     itemName: item.itemName,
        //     image: item.image,
        //     itemPrice: pointCost,
        //     purchaseDate: purchaseDate
        // } as ItemPurchaseAdmin;
        // Send emails (non-blocking)
        Promise.all([
            emailHelper.sendEmail(
                emailTemplate.purchaseConfirmationTemplate(customerEmailData)
            ),
            // emailHelper.sendEmail(
            //     emailTemplate.adminPurchaseNotificationTemplate(adminEmailData)
            // )
        ]).catch(error => {
            console.error("Email sending failed:", error);
        });

        // return otp;

    } catch (error) {
        console.error("Purchase failed:", error);
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Failed to process purchase"
        );
    }
};


const buyItemHistory = async (user: JwtPayload, query: any) => {
    const visitor = await User.findById(user.id);
    if (!visitor) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const itemHistory = Transaction.find({ userId: user.id, type: "redeem" }).lean();

    const queryBuilder = new QueryBuilder(itemHistory, query)
        .search(['name', 'email'])
        .filter()
        .dateRange()
        .sort()
        .paginate();
    const [meta, data] = await Promise.all([
        queryBuilder.getMeta(),
        queryBuilder.build(),
    ]);
    if (data.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, "No purchase history found");
    }

    return { data, meta };
};

export const ItemService = {
    createItem,
    getAllItem,
    ItemDetails,
    buyItem,
    buyItemHistory
}