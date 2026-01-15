import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { DashboardController } from "./dashboard.controller";

const router = Router();


router.route("/")
    .get(auth(USER_ROLES.ADMIN), DashboardController.getDashboardData)


export const DashboardRouter = router