import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryValidation } from "./category.validation";
import { CategoryController } from "./category.controller";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { parseFormDataMiddleware } from "../../middlewares/ParseFormData";

const router = Router();


router.route("/create")
    .post(auth(USER_ROLES.ADMIN),
        fileUploadHandler(),
        parseFormDataMiddleware,
        validateRequest(CategoryValidation.createCategoryZodSchema),
        CategoryController.createCategory)

router.route("/all")
    .get(CategoryController.getAllCategory)

router.route("/:id")
    .patch(auth(USER_ROLES.ADMIN),
        fileUploadHandler(),
        parseFormDataMiddleware,
        validateRequest(CategoryValidation.updateCategoryZodSchema),
        CategoryController.updateCategory)
    .delete(auth(USER_ROLES.ADMIN),
        CategoryController.deleteCategory)


export const CategoryRoutes = router