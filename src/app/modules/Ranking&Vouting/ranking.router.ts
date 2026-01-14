import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { RankingController } from "./ranking.controller";

const router = Router()


router.route("/:id")
    .post(auth(USER_ROLES.USER), RankingController.giveVote)



export const Ranking_Voting_Router = router