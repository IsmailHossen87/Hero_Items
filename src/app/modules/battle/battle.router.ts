import { Router } from "express";
import { battleController } from "./battle.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

// battle.router.ts
const router = Router();

router.get("/", auth(USER_ROLES.USER), battleController.getBattle)


export const battleRouter = router;