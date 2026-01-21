import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { ModelController } from "./model.controller";

// model.router.ts
const router = Router();

router.route('/')
    .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER), ModelController.getModels)
    .post(auth(USER_ROLES.ADMIN), ModelController.createModel)


export const ModelRoutes = router