import cron from "node-cron";
import { battleService } from "./battle.service";


// 0 0 * * *   ---- rat 12 ta
//59 23 * * *  ---- rat 11.59
// */5 * * * * ---- every 5 minit
//4-59/5 * * * * --- daily 4 minit 59 second

// 0 0 * * *    ---- রাত ১২টা (production)
// */1 * * * *  ---- প্রতি ১ মিনিট (testing)
export const startBattleCron = () => cron.schedule("0 0 * * *", async () => {
    console.log("⚔️ Battle generation running...");
    await battleService.generateDailyBattles();
});



export const closeBattleCron = () => cron.schedule("59 23 * * *", async () => {
    console.log("⏰ Closing daily battles...");
    await battleService.closeDailyBattles();
});