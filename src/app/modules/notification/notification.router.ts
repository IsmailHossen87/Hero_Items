import { Router } from "express";
import { NotificationController } from "./notification.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

// notification.router.ts
const router = Router()
router.route("/")
    .post(NotificationController.sendNotification)
    .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER), NotificationController.getAllNotification)

router.route("/:id")
    .delete(NotificationController.deleteNotification)

export const notificationRouter = router