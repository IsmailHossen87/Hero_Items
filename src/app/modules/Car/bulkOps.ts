import { Car } from "./car.model";


export const syncCarFieldsFromCategory = async (filter: Record<string, any> = {}) => {
    const cars = await Car.find(filter).populate({
        path: "category",
        select: "battleCost Reward name",
    });

    if (!cars.length) return;

    const bulkOps = cars.map((car: any) => ({
        updateOne: {
            filter: { _id: car._id },
            update: {
                battleCost: car.category?.battleCost ?? 0,
                Reward: car.category?.Reward ?? 0,
                categoryName: car.category?.name ?? "",
            },
        },
    }));

    await Car.bulkWrite(bulkOps);
};
