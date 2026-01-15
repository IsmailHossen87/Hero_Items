import { JwtPayload } from "jsonwebtoken";
import { Item } from "./item.model";
import { USER_ROLES } from "../../../enums/user";
import { Query } from "mongoose";
import { QueryBuilder } from "../../../util/QueryBuilder";
import { searchableFieldsItem } from "./item.interface";

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

    return { meta, AllItemsLength, avtiveItemsLength, inactiveItemsLength, data, };
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

    // শুধুমাত্র যখন ActiveStatus === true তখনই toggle হবে
    if (ActiveStatus === true) {
        if (!user || user.role !== USER_ROLES.ADMIN) {
            throw new Error("You are not authorized to toggle item status");
        }

        item.status = item.status === "Active" ? "Inactive" : "Active";
        await item.save();
    }

    return item;
};


export const ItemService = {
    createItem,
    getAllItem,
    ItemDetails
}