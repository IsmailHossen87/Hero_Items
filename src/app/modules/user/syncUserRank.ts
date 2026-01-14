import { Car } from "../Car/car.model";
import { User } from "./user.model";

export const syncUserRank = async () => {
    // Aggregate votes per user
    const userRanks = await Car.aggregate([
        {
            $group: {
                _id: "$userId",
                totalVotes: { $sum: "$votes" },
            },
        },
    ]);

    if (!userRanks.length) return;

    const bulkOps = userRanks.map((user) => ({
        updateOne: {
            filter: { _id: user._id },
            update: { ranking: user.totalVotes ?? 0 },
        },
    }));

    await User.bulkWrite(bulkOps);

    // Optional: reset rank for users with no cars
    await User.updateMany(
        { _id: { $nin: userRanks.map((u) => u._id) } },
        { ranking: 0 }
    );
};
