import { Router } from "express";
import { battleController } from "./battle.controller";

// battle.router.ts
const router = Router();

router.get("/random", battleController.RandomBattle)

export const battleRouter = router;