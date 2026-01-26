import { JwtPayload } from "jsonwebtoken";
import AppError from "../../../errors/AppError"
import { IStatus } from "../Car/car.interface";
import { Car } from "../Car/car.model"
import { User } from "../user/user.model"
import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from "../../../enums/user";
import { Setting } from "../Setting/setting.model";
import { isSameDay } from "../user/user.service";
import { saveNotification } from "../notification/sharedNotification";
import { NOTIFICATION_TYPE } from "../notification/notification.interface";
import { sendReaujableNotification } from "../notification/notification.model";

const giveVote = async (userId: string, carId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    const car = await Car.findById(carId);

    if (!car) {
        throw new AppError(StatusCodes.NOT_FOUND, "Car not found");
    }
    const carOwner = await User.findById(car?.userId)

    if (car.status !== IStatus.APPROVED) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Car is not approved");
    }

    if (user.coin < car.battleCost) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Not enough coins");
    }

    // 🔥 Admin setting load
    const settings = await Setting.findOne();
    const dailyLimit = settings?.voteLimit ?? 0;

    const today = new Date();

    // 🔄 New day হলে reset
    if (!user.lastVoteDate || !isSameDay(user.lastVoteDate, today)) {
        user.dailyVoteCount = 0;
    }

    // ❌ Limit crossed
    if (user.dailyVoteCount >= dailyLimit) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "Daily vote limit exceeded"
        );
    }
    // ✅ Vote success
    updateRanking(user, car);

    // FIRREBASE NOTIFICATION  🔔🔔🔔🔔🔔
    //  sendReaujableNotification({
    //     fcmToken: user?.fcmToken,
    //     title: "Vote Given",
    //     body: "Your vote has been given successfully",
    //     type: NOTIFICATION_TYPE.VOTE,
    //     carId: car._id.toString(),
    //     senderId: user._id.toString(),
    //     receiverId: car.userId.toString(),
    //     image: car.images?.[0],
    // });
    //  sendReaujableNotification({
    //     fcmToken: carOwner?.fcmToken,
    //     title: "Get Vote",
    //     body: "Your car has been voted successfully",
    //     type: NOTIFICATION_TYPE.VOTE,
    //     carId: car._id.toString(),
    //     senderId: user._id.toString(),
    //     receiverId: car.userId.toString(),
    //     image: car.images?.[0],
    // });

    const valueForNotification = {
        senderId: user._id,
        receiverId: car.userId,
        title: "Vote Given",
        body: "Your vote has been given successfully",
        carId: car._id,
        notificationType: "NOTIFICATION",
        type: NOTIFICATION_TYPE.VOTE,
        status: "SUCCESS",
    }

    saveNotification(valueForNotification)
    // 🔔🔔🔔🔔🔔

    user.dailyVoteCount += 1;
    user.lastVoteDate = today;
    user.coin -= car.battleCost;

    user.save();

    return {
        message: "Vote given successfully",
        remainingVote: dailyLimit - user.dailyVoteCount,
    };
};


const updateRanking = async (user: any, car: any) => {
    console.log("user and car", user, car)
    // ✅ Deduct coins and add reward
    user.coin -= car.battleCost;
    user.coin += car.Reward;
    await user.save();

    // ✅ Increment votes
    car.votes += 1;
    car.votersIds.push(user._id);
    await car.save();

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
    car.votersIds = [];
    car.Top = 0;
    car.ranking = 0;
    await car.save();
    return '';
}

export const RankingService = { giveVote, vuterHistory, resetVote }