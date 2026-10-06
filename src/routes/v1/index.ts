import { Router } from 'express';
import authRoute from './auth.route';
import otpRoute from './otp.route';
import statsRoute from './stats.route';
import wordleRoute from './wordle.route';
import dailyRoute from './daily.route';
import appVersionRoute from './appVersion.route';

const router = Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/otp',
    route: otpRoute,
  },
  {
    path: '/stats',
    route: statsRoute,
  },
  {
    path: '/wordle',
    route: wordleRoute,
  },
  {
    path: '/daily',
    route: dailyRoute,
  },
  {
    path: '/app-version',
    route: appVersionRoute,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
