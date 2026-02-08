import { Category } from "../Category/category.model";
import { Car } from "./car.model";


export const syncCarFieldsFromCategory = async (filter: Record<string, any> = {}) => {
    const cars = await Car.find(filter).populate({
        path: "category",
        select: "credit  name",
    });
    if (!cars.length) return;


    const bulkOps = cars.map((car: any) => ({
        updateOne: {
            filter: { _id: car._id },
            update: {
                credit: car.category?.credit ?? 0,
                categoryName: car.category?.name ?? "",
            },
        },
    }));

    await Car.bulkWrite(bulkOps);
};
