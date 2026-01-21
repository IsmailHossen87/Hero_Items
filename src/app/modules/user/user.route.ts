import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { parseFormDataMiddleware } from '../../middlewares/ParseFormData';

const router = express.Router();

router
  .route('/profile')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.ORGANIZER),
    UserController.getUserProfile
  )
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    fileUploadHandler(),
    parseFormDataMiddleware,
    UserController.updateProfile
  );

router.route('/').get(UserController.getAllUser);
router.route('/daily-claim').get(auth(USER_ROLES.USER), UserController.dailyClaim)
router.route('/daily-preview').get(auth(USER_ROLES.USER), UserController.dailyPreview)

router
  .route('/create')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  );
router.route('/follow/:id').
  post(auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.ORGANIZER), UserController.followUser)


export const UserRoutes = router;
