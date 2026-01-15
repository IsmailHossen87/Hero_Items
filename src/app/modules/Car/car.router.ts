import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { parseMultipleFilesdata } from "../../middlewares/parseMultipleFileData";
import { carController } from "./car.controller";

const router = Router()

router.route("/create")
    .post(auth(USER_ROLES.USER), fileUploadHandler(), parseMultipleFilesdata("image"), carController.createCar)


router.route("/all-car")
    .get(carController.getAllCars)


router.route("/my-car")
    .get(auth(USER_ROLES.USER, USER_ROLES.ADMIN), carController.getMyCars)

router.route("/:id")
    .get(auth(USER_ROLES.USER, USER_ROLES.ADMIN), carController.carDetails)
    .patch(auth(USER_ROLES.ADMIN), carController.changeStatus)

router.route("/specific-category/:id")
    .get(carController.getSpecificCategoryCars)

export const CarRouter = router;