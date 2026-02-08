import cors from 'cors';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import webhookHandler from './app/modules/stripeAccount/webhookHandler';
import './app/config/Passport';
import passport from 'passport';
import expressSession from 'express-session';
import { Morgan } from './shared/morgen';
import { closeBattleCron, startBattleCron } from './app/modules/battle/battleCron';

const app = express();

// ⚠️ IMPORTANT: Session and Passport BEFORE webhook
app.use(
  expressSession({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());

// Morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// CORS
app.use(cors({
  origin: [
    "http://10.10.7.37:3000",
    "http://10.10.7.37:3001",
    "http://10.10.7.37:3002",
    "https://hero-itens-admin-dashboard.vercel.app"
  ],
  credentials: true,
}));

// ✅ STRIPE WEBHOOK MUST BE **BEFORE** express.json()
app.post(
  '/api/v1/stripe/webhook',
  express.raw({ type: 'application/json' }),
  webhookHandler
);

// ⚠️ Body parsers MUST come AFTER webhook route
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File retrieve
app.use(express.static('uploads'));

// Router
app.use('/api/v1', router);

// Live response
app.get('/', (req: Request, res: Response) => {
  const date = new Date(Date.now());
  res.send(
    `<h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>`
  );
});

startBattleCron();
closeBattleCron();

// Global error handler
app.use(globalErrorHandler);

// Handle not found route
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;