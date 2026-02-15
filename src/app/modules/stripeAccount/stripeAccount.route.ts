import { Router } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { stripeAccountController } from './stripeAccountController';


const stripeAccountRoutes = Router();
stripeAccountRoutes.post('/connected-user/login-link', auth(USER_ROLES.ORGANIZER, USER_ROLES.USER), stripeAccountController.stripeLoginLink);
stripeAccountRoutes
    .post('/create-connected-account', auth(USER_ROLES.ORGANIZER, USER_ROLES.USER), stripeAccountController.createStripeAccount)  // 1. create connected stripe account + onboarding link
    .get('/success-account/:id', stripeAccountController.successPageAccount) // 2. stripe onboarding success redirect
    .get('/refreshAccountConnect/:id', stripeAccountController.refreshAccountConnect); // 3. stripe onboarding refresh (if user cancels)

stripeAccountRoutes.get('/success-account/:accountId', stripeAccountController.onConnectedStripeAccountSuccess); // 2. stripe onboarding success redirect

export default stripeAccountRoutes;
