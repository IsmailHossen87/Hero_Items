import { Router } from "express";
import { PurchaseController } from "./tire.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

// purchase.router.ts
const router = Router();
router.route('/')
    .post(auth(USER_ROLES.ADMIN), PurchaseController.createTire)
    .get(auth(USER_ROLES.ADMIN), PurchaseController.getAllTire)

router.route("/:id")
    .get(auth(USER_ROLES.ADMIN), PurchaseController.getTireById)
    .patch(auth(USER_ROLES.ADMIN), PurchaseController.updateTire)
    .delete(auth(USER_ROLES.ADMIN), PurchaseController.deleteTire)

export const tireRouter = router;