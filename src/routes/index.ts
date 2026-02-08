import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { PaymentRouter } from '../app/modules/Payment/Payment.route';
import { CategoryRoutes } from '../app/modules/Category/category.router';
import { CarRouter } from '../app/modules/Car/car.router';
import { Ranking_Voting_Router } from '../app/modules/Ranking&Vouting/ranking.router';
import { ItemRouter } from '../app/modules/Item/item.router';
import { DashboardRouter } from '../app/modules/Dashboard/dashboard.router';
import { SettingRouter } from '../app/modules/Setting/setting.router';
import { ModelRoutes } from '../app/modules/model/model.router';
import { notificationRouter } from '../app/modules/notification/notification.router';
import { battleRouter } from '../app/modules/battle/battle.router';


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
    path: '/ranking',
    route: Ranking_Voting_Router
  },
  {
    path: '/dashboard',
    route: DashboardRouter
  },
  {
    path: '/item',
    route: ItemRouter
  },
  {
    path: '/payment',
    route: PaymentRouter,
  }, {
    path: '/setting',
    route: SettingRouter,
  },
  {
    path: '/model',
    route: ModelRoutes
  },
  {
    path: '/battle',
    route: battleRouter
  },
  {
    path: '/notification',
    route: notificationRouter
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
