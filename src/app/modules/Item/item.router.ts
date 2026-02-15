import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { ItemController } from "./item.controller";
import { parseFormDataMiddleware } from "../../middlewares/ParseFormData";

const router = Router();

router.route("/")
    .post(auth(USER_ROLES.ADMIN), fileUploadHandler(), parseFormDataMiddleware, ItemController.createItem)
    .get(ItemController.getAllItem)

router.route("/buy-item-history")
    .get(auth(USER_ROLES.USER), ItemController.buyItemHistory)

router.route("/:id")
    .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER), ItemController.ItemDetails)
router.route("/buy-item/:id")
    .get(auth(USER_ROLES.USER), ItemController.buyItem)


export const ItemRouter = router