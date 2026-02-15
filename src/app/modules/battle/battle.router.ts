import { Router } from "express";
import { battleController } from "./battle.controller";

// battle.router.ts
const router = Router();

router.get("/", battleController.getBattle)


export const battleRouter = router;