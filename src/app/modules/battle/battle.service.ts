import mongoose from "mongoose";
import AppError from "../../../errors/AppError";
import { QueryBuilder } from "../../../util/QueryBuilder";
import { Car } from "../Car/car.model";
import { User } from "../user/user.model";
import { Battle } from "./battle.model";
import httpstatus from "http-status-codes"

// ✅ Daily Cron - রাত ১২টায় সব approved cars এর মধ্যে battles generate করে
const generateDailyBattles = async () => {
    const cars = await Car.find({ status: "APPROVED" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const battles = [];

    for (let i = 0; i < cars.length; i++) {
        for (let j = i + 1; j < cars.length; j++) {

            const car1 = cars[i];
            const car2 = cars[j];

            // ✅ Same category কিনা check
            if (car1.category.toString() !== car2.category.toString()) {
                continue;
            }

            // ✅ এই specific pair এর আজকের battle আগে তৈরি হয়েছে কিনা check
            const exists = await Battle.findOne({
                $or: [
                    { car1: car1._id, car2: car2._id },
                    { car1: car2._id, car2: car1._id }
                ],
                battleDate: { $gte: today }
            });
            if (exists) continue;

            const battle = await Battle.create({
                car1: car1._id,
                categoryId: car1.category,
                car2: car2._id,
                battleDate: today
            });

            battles.push(battle);
        }
    }

    return battles;
};

// ✅ Car approve হলে সাথে সাথে নতুন car কে battle এ add করে
export const addNewCarToBattles = async (newCarId: string) => {
    const newCar = await Car.findById(newCarId);
    if (!newCar) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Same category এর other approved cars খোঁজো
    const otherCars = await Car.find({
        status: "APPROVED",
        category: newCar.category,
        _id: { $ne: newCar._id }
    });

    const battles = [];

    for (const otherCar of otherCars) {
        // ✅ এই pair এর battle আর আগে হয়েছে কিনা check
        const exists = await Battle.findOne({
            $or: [
                { car1: newCar._id, car2: otherCar._id },
                { car1: otherCar._id, car2: newCar._id }
            ],
            battleDate: { $gte: today }
        });
        if (exists) continue;

        const battle = await Battle.create({
            car1: newCar._id,
            categoryId: newCar.category,
            car2: otherCar._id,
            battleDate: today
        });

        battles.push(battle);
    }

    console.log(`✅ New car [${newCarId}] added to ${battles.length} battle(s)`);
    return battles;
};


const closeDailyBattles = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const battles = await Battle.find({
        status: "PENDING",
        // battleDate: {
        //     $gte: today,
        //     // $lt: tomorrow
        // }
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

        // const rewardCoin = winnerCar.credit * 10;

        // ✅ voters reward
        // if (battle.votersIds?.length > 0) {
        //     await User.updateMany(
        //         { _id: { $in: battle.votersIds } },
        //         // { $inc: { coin: rewardCoin } }
        //     );
        // }
        // ✅ battle close
        await Battle.findByIdAndUpdate(battle._id, {
            status: "COMPLETED",
            winner: winnerCarId
        });
    }

    return { closedBattles: battles.length };
};


// const getBattle = async (query: any, userId: string) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);

//     const battle = Battle.find({ status: "PENDING", battleDate: { $gte: today, $lt: tomorrow } })
//         .populate("car1 car2")
//         .select("-votersIds")
//         .lean()

//     const querybuilder = new QueryBuilder(battle, query)
//         .search(['name categoryName'])
//         .filter()
//         .paginate()
//         .sort()

//     const [meta, data] = await Promise.all([
//         querybuilder.getMeta(),
//         querybuilder.build()
//     ])

//     const myBattles = data?.filter((battle: any) =>
//         battle.voteTrack?.some((v: any) => v.userId.toString() === userId)
//     );

//     console.log("My Battles 🛫🛫👨", myBattles);

//     if (data.length <= 0) {
//         throw new AppError(httpstatus.NOT_FOUND, 'No battles found')
//     }

//     return { meta, data: { AllBattleData: data } };
// }
const getBattle = async (query: any, userId: string) => {
    const usersId = new mongoose.Types.ObjectId(userId)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const battleQuery = Battle.find({
        status: "PENDING",
        // battleDate: { $gte: today, $lt: tomorrow }
    })
        .populate({
            path: "car1",
            populate: {
                path: "userId",
                select: "name image"
            }
        })
        .populate({
            path: "car2",
            populate: {
                path: "userId",
                select: "name image"
            }
        })
        .select("-votersIds")
        .lean();

    const querybuilder = new QueryBuilder(battleQuery, query)
        .search(['name', 'categoryName'])
        .filter()
        .paginate()
        .sort();

    const [meta, data] = await Promise.all([
        querybuilder.getMeta(),
        querybuilder.build()
    ]);

    if (!data || data.length === 0) {
        throw new AppError(httpstatus.NOT_FOUND, 'No battles found');
    }


    const updatedData = await Promise.all(
        data.map(async (battle: any) => {
            const userVote = (battle.voteTrack || []).find(
                (v: any) => v.userId.toString() === usersId.toString()
            );

            const car1 = {
                ...battle.car1,
                isVoted: userVote?.carId.toString() === battle.car1._id.toString(),
            };

            const car2 = {
                ...battle.car2,
                isVoted: userVote?.carId.toString() === battle.car2._id.toString(),
            };

            const { voteTrack, ...rest } = battle;

            return {
                ...rest,
                car1,
                car2
            };
        })
    );

    return {
        meta,
        data: updatedData
    };
};



export const battleService = {
    generateDailyBattles,
    addNewCarToBattles,
    closeDailyBattles,
    getBattle
};
