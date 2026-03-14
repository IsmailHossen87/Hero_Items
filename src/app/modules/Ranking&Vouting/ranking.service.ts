import { JwtPayload } from "jsonwebtoken";
import AppError from "../../../errors/AppError"
import { IStatus } from "../Car/car.interface";
import { Car } from "../Car/car.model"
import { User } from "../user/user.model"
import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from "../../../enums/user";
import { Setting } from "../Setting/setting.model";
import { isSameDay } from "../user/user.service";
import { Battle } from "../battle/battle.model";
import { Types } from "mongoose";
import { Category } from "../Category/category.model";

const giveVote = async (userId: string, battleId: string, carId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

    const car = await Car.findById(carId);
    if (!car) throw new AppError(StatusCodes.NOT_FOUND, "Car not found");
    const carOwner = await User.findById(car.userId);

    if (car.status !== IStatus.APPROVED) throw new AppError(StatusCodes.BAD_REQUEST, "Car is not approved");

    // 5️⃣ Check user coins
    if ((user.dailyCredit + user.moneyCredit) < car.credit) throw new AppError(StatusCodes.BAD_REQUEST, "Not enough credit,Please Buy Credit");

    const today = new Date();

    // 7️⃣ Reset daily vote if new day
    if (!user.lastVoteDate || !isSameDay(user.lastVoteDate, today)) {
        user.dailyVoteCount = 0;
    }

    // ------------------------------     MAIN LOGIN    ------------------------------

    const battle = await Battle.findOne({
        _id: battleId,
        $or: [{ car1: car._id }, { car2: car._id }]
    });

    if (!battle) {
        throw new Error("Battle not found");
    }

    // prevent duplicate vote
    if (battle.votersIds.some(id => id.toString() === user._id.toString())) {
        throw new Error("You already voted");
    }
    await updateRanking(user, car);

    // increase vote count
    if (battle.car1.toString() === car._id.toString()) {
        battle.votesCar1 += 1;
    } else {
        battle.votesCar2 += 1;
    }

    battle.votersIds.push(user._id);
    car.earnPoints += car.credit;
    // user.point += car.credit

    battle.voteTrack.push({
        userId: user._id,
        carId: new Types.ObjectId(car._id),
        vote: car.credit
    });

    await car.save();
    await battle.save();

    user.dailyVoteCount += 1;
    user.lastVoteDate = today;
    await user.save();

    // 13️⃣ Return response
    return {
        message: "Vote given successfully",
        // remainingVote: dailyLimit - user.dailyVoteCount,
    };
};


const updateRanking = async (user: any, car: any) => {
    const category = await Category.findById(car.category);
    if (!category) throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
    const voteCostCredit = car.credit;
    const coin = category.credit * 10;
    user.coin += coin;


    if (user.dailyCredit >= voteCostCredit) {
        user.dailyCredit -= voteCostCredit;
    } else {
        const remainingCost = voteCostCredit - user.dailyCredit;
        user.dailyCredit = 0;
        user.moneyCredit -= remainingCost;
    }
    car.votes += 1;
    car.userVotes = true;

    await car.save();
    await user.save();
    // ✅ Update ranking and Top for all cars
    const cars = await Car.find().sort({ votes: -1 });
    const totalCars = cars.length;

    if (totalCars <= 100) {
        // Function to calculate Top based on rank
        const calculateTop = (rank: number) => {
            if (rank <= 10) return 10;
            return Math.ceil((rank - 10) / 5) * 5 + 10;
        };

        // After voting, update ranking and Top
        const cars = await Car.find().sort({ votes: -1 });
        for (let i = 0; i < cars.length; i++) {
            const rank = i + 1;
            const top = calculateTop(rank);
            await Car.findByIdAndUpdate(cars[i]._id, { ranking: rank, Top: top });
        }

    } else {
        for (let i = 0; i < totalCars; i++) {
            const rank = i + 1;
            const topPercent = (rank / totalCars) * 100;
            await Car.findByIdAndUpdate(cars[i]._id, { ranking: rank, Top: topPercent });
        }
    }


}


// VUT HIStory
const vuterHistory = async (caiId: string, user: JwtPayload) => {
    const userHistory = await User.findById(user.id);
    if (!userHistory) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }
    if (user.role !== USER_ROLES.ADMIN) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized to get vut history");
    }
    const history = await Car.findById({ _id: caiId }).populate({ path: "votersIds", select: "name" }).sort({ createdAt: -1 });
    return history;
}


// 🈯🈯🈯
const resetVote = async (carId: string, user: JwtPayload) => {
    if (user.role !== USER_ROLES.ADMIN) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized to reset vote");
    }
    const car = await Car.findById(carId);

    if (!car) {
        throw new AppError(StatusCodes.NOT_FOUND, "Car not found");
    }
    car.votes = 0;
    car.earnPoints = 0;
    car.Top = 0;
    car.ranking = 0;
    await car.save();
    return '';
}



const myVoteHistory = async (battleId: string, user: JwtPayload) => {
    const userHistory = await User.findById(user.id);
    if (!userHistory) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }
    const battle = await Battle.findById(battleId);

    const userVote = battle?.voteTrack.find(
        (vote) => vote.userId.toString() === user.id
    );

    return {
        ...battle?.toObject(),
        votedCarId: userVote ? userVote.carId : null
    };

}

export const RankingService = { giveVote, vuterHistory, resetVote, myVoteHistory }