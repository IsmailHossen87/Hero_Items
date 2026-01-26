import { Router } from "express";
import { NotificationController } from "./notification.controller";

// notification.router.ts
const router = Router()
router.route("/")
    .post(NotificationController.sendNotification)

export const notificationRouter = router