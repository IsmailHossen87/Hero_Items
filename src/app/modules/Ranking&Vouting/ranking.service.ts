import AppError from "../../../errors/AppError"
import { IStatus } from "../Car/car.interface";
import { Car } from "../Car/car.model"
import { User } from "../user/user.model"
import { StatusCodes } from 'http-status-codes';

const giveVote = async (userId: string, carId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    const car = await Car.findById(carId);
    if (!car) {
        throw new AppError(StatusCodes.NOT_FOUND, "Car not found");
    }

    if (car.status !== IStatus.APPROVED) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Car is not approved");
    }

    if (user.coin < car.battleCost) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Not enough coins");
    }

    updateRanking(user, car);
    return '';
};

const updateRanking = async (user: any, car: any) => {

    // ✅ Deduct coins and add reward
    user.coin -= car.battleCost;
    user.coin += car.Reward;
    await user.save();

    // ✅ Increment votes
    car.votes += 1;
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
        const cars = await Car.find().sort({ votes: -1 }); // Highest votes first
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



export const RankingService = { giveVote }