import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { NotificationRoutes } from '../app/modules/ADMIN/Notification/notification.route';
import { PaymentRouter } from '../app/modules/Payment/Payment.route';
import { SettingRouter } from '../app/modules/Settings/SettingRoute';
import { CategoryRoutes } from '../app/modules/Category/category.router';
import { CarRouter } from '../app/modules/Car/car.router';


const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: "/car",
    route: CarRouter
  },
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/payment',
    route: PaymentRouter,
  },
  {
    path: '/setting',
    route: SettingRouter,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
