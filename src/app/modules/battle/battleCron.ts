import cron from "node-cron";
import { battleService } from "./battle.service";


// 0 0 * * *

export const startBattleCron = () => cron.schedule("0 0 * * *", async () => {
    console.log("Daily battle generation started");
    await battleService.generateDailyBattles();
});


export const closeBattleCron = () => cron.schedule("59 23 * * *", async () => {
    console.log("⏰ Closing daily battles...");
    await battleService.closeDailyBattles();
});