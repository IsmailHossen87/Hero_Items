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



router.get('/', UserController.getAllUser);
router.get('/purchase-history', auth(USER_ROLES.USER), UserController.getPurchaseHistory)
router.post('/daily-claim', auth(USER_ROLES.USER), UserController.dailyClaim)
router.get('/daily-preview', auth(USER_ROLES.USER), UserController.dailyPreview)
router.delete("/delete/:id", auth(USER_ROLES.ADMIN, USER_ROLES.USER), UserController.deleteUser)

router
  .route('/create')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  );
router.post('/follow/:id', auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.ORGANIZER), UserController.followUser)

export const UserRoutes = router;
