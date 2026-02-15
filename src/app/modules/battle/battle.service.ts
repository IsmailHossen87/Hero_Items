import AppError from "../../../errors/AppError";
import { QueryBuilder } from "../../../util/QueryBuilder";
import { Car } from "../Car/car.model";
import { User } from "../user/user.model";
import { Battle } from "./battle.model";
import httpstatus from "http-status-codes"

const generateDailyBattles = async () => {
    const cars = await Car.find({ status: "APPROVED" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const battles = [];

    for (let i = 0; i < cars.length; i++) {
        for (let j = i + 1; j < cars.length; j++) {

            const car1 = cars[i];
            const car2 = cars[j];

            // ✅ Category same কিনা check
            if (car1.category.toString() !== car2.category.toString()) {
                continue;
            }

            const battleNumber = `${car1._id}_${car2._id}_${today.toISOString().slice(0, 10)}`;

            const exists = await Battle.findOne({ battleNumber });
            if (exists) continue;

            const battle = await Battle.create({
                car1: car1._id,
                categoryId: car1.category,
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


const getBattle = async (query: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const battle = Battle.find({ status: "PENDING", battleDate: { $gte: today, $lt: tomorrow } })
        .populate("car1 car2", "modelName images categoryName manufacturer")
        .select("-voteTrack -votersIds")
        .lean()

    const querybuilder = new QueryBuilder(battle, query)
        .search(['name categoryName'])
        .filter()
        .paginate()
        .sort()

    const [meta, data] = await Promise.all([
        querybuilder.getMeta(),
        querybuilder.build()
    ])

    if (data.length <= 0) {
        throw new AppError(httpstatus.NOT_FOUND, 'No battles found')
    }

    const battleInfo = await data.map((car: any) => {
        const { car1, car2, ...rest } = car
        console.log(car1)
        return {
            ...rest,
            car1Image: car1.images[0],
            categoryName1: car1.categoryName,
            car2Image: car2.images[0],
            categoryName2: car2.categoryName
        }

    })

    return { meta, data: battleInfo };
}

export const battleService = {
    generateDailyBattles,
    closeDailyBattles,
    getBattle
};
