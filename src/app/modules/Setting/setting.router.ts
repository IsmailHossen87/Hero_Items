import { Router } from "express";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import { SettingController } from "./setting.controller";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { parseFormDataMiddleware } from "../../middlewares/ParseFormData";

const router = Router();


router.route("/globalSetting")
    .put(auth(USER_ROLES.ADMIN), fileUploadHandler(), parseFormDataMiddleware, SettingController.globalSettingCreate)


router.route("/termsCondition")
    .put(auth(USER_ROLES.ADMIN), SettingController.termsConditionCreate)
router.route("/privacyPolicy")
    .put(auth(USER_ROLES.ADMIN), SettingController.privacyPolicyCreate)

router.route("/:key")
    .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER), SettingController.getSetting)

export const SettingRouter = router
