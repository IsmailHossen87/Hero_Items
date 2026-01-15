import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { RankingController } from "./ranking.controller";

const router = Router()

router.route("/:id")
    .get(auth(USER_ROLES.ADMIN), RankingController.getVutHistory)
    .post(auth(USER_ROLES.USER), RankingController.giveVote)
    .patch(auth(USER_ROLES.ADMIN), RankingController.resetVote)



export const Ranking_Voting_Router = router