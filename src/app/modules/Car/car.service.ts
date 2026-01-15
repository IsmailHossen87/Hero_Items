import { USER_ROLES } from "../../../enums/user"
import { QueryBuilder } from "../../../util/QueryBuilder"
import { syncUserRank } from "../user/syncUserRank"
import { User } from "../user/user.model"
import { syncCarFieldsFromCategory } from "./bulkOps"
import { ICar, IStatus, searchableFields } from "./car.interface"
import { Car } from "./car.model"

const createCar = async (payload: ICar) => {
    const car = await Car.create(payload)
    await syncUserRank();
    return car
}

const getAllCars = async (query: any) => {
    // await syncCarFieldsFromCategory();
    const queryBuilder = new QueryBuilder(Car.find().populate({ "path": "userId", "select": "name" }).sort({ ranking: -1 }), query)

    const allCars = await queryBuilder.
        search(searchableFields)
        .filter()
        .sort()
        .paginate()

    const [meta, data] = await Promise.all([
        allCars.getMeta(),
        allCars.build()
    ])

    return { meta, data }
}
const SpecificCategoryCars = async (query: any, categoryId: string) => {
    // await syncCarFieldsFromCategory();
    const queryBuilder = new QueryBuilder(Car.find({ category: categoryId }).populate({ "path": "userId", "select": "name" }), query)

    const allCars = await queryBuilder.
        search(searchableFields)
        .filter()
        .sort()
        .paginate()

    const [meta, data] = await Promise.all([
        allCars.getMeta(),
        allCars.build()
    ])

    return { meta, data }
}


// MY Cars
const myCars = async (query: any, userId: string) => {

    // await syncCarFieldsFromCategory({ userId: userId, status: IStatus.APPROVED });

    const queryBuilder = new QueryBuilder(Car.find({ userId: userId, status: IStatus.APPROVED }).populate({ "path": "userId", "select": "name" }).sort({ ranking: -1 }), query)
    const myCars = await queryBuilder.
        filter()
        .sort()
        .paginate()

    const [meta, data] = await Promise.all([
        myCars.getMeta(),
        myCars.build()
    ])

    return { meta, data }
}

// CAR details
const carDetails = async (carId: string, userId: string) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new Error("User not found")
    }
    // car
    const car = await Car.findById(carId).populate({
        path: "userId",
        select: "name"
    }).populate({
        path: "category",
        select: "battleCost Reward name"
    });
    if (!car) {
        throw new Error("Car not found")
    }

    await Car.findByIdAndUpdate(
        carId,
        {
            battleCost: (car.category as any)?.battleCost ?? 0,
            Reward: (car.category as any)?.Reward ?? 0,
            categoryName: (car.category as any)?.name ?? ""
        },
        { new: true }
    );

    return car
}

// STATUS   __________ Change
const changeStatus = async (carId: string, userId: string) => {
    const user = await User.findById(userId)

    if (!user) {
        throw new Error("User not found")
    }
    if (user.role !== USER_ROLES.ADMIN) {
        throw new Error("You are not authorized to change the status")
    }
    const CarInfo = await Car.findById(carId)
    if (!CarInfo) {
        throw new Error("Car not found")
    }

    let status;
    if (CarInfo.status === IStatus.PENDING) {
        status = IStatus.APPROVED
    } else if (CarInfo.status === IStatus.APPROVED) {
        status = IStatus.REJECTED
    } else {
        status = IStatus.PENDING
    }
    await syncCarFieldsFromCategory({ _id: carId });

    const car = await Car.findByIdAndUpdate({ _id: carId }, { status }, { new: true })
    return car
}
export const CarService = { createCar, getAllCars, myCars, carDetails, changeStatus, SpecificCategoryCars }