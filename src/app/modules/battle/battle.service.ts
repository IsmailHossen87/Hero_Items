import { Car } from "../Car/car.model";
import { User } from "../user/user.model";
import { Battle } from "./battle.model";

const generateDailyBattles = async () => {
    const cars = await Car.find({ status: "APPROVED" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const battles = [];

    for (let i = 0; i < cars.length; i++) {
        for (let j = i + 1; j < cars.length; j++) {

            const car1 = cars[i];
            const car2 = cars[j];

            const battleNumber = `${car1._id}_${car2._id}_${today.toISOString().slice(0, 10)}`;

            const exists = await Battle.findOne({ battleNumber });
            if (exists) continue;

            const battle = await Battle.create({
                car1: car1._id,
                car2: car2._id,
                battleNumber,
                battleDate: today
            });

            battles.push(battle);
        }
    }

    return battles;
};


const closeDailyBattles = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const battles = await Battle.find({
        status: "PENDING",
        battleDate: {
            $gte: today,
            $lt: tomorrow
        }
    });

    for (const battle of battles) {
        let winnerCarId: any = null;

        if (battle.votesCar1 > battle.votesCar2) {
            winnerCarId = battle.car1;
        } else if (battle.votesCar2 > battle.votesCar1) {
            winnerCarId = battle.car2;
        }

        // ✅ draw হলে skip (optional)
        if (!winnerCarId) {
            await Battle.findByIdAndUpdate(battle._id, {
                status: "COMPLETED",
                winner: null
            });
            continue;
        }

        // ✅ winner car load
        const winnerCar = await Car.findById(winnerCarId);
        if (!winnerCar) continue;

        const rewardCoin = winnerCar.credit;

        // ✅ voters reward
        if (battle.votersIds?.length > 0) {
            await User.updateMany(
                { _id: { $in: battle.votersIds } },
                { $inc: { coin: rewardCoin } }
            );
        }

        // ✅ battle close
        await Battle.findByIdAndUpdate(battle._id, {
            status: "COMPLETED",
            winner: winnerCarId
        });
    }

    return { closedBattles: battles.length };
};



export const battleService = {
    generateDailyBattles,
    closeDailyBattles
};
