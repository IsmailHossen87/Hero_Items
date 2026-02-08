import { USER_ROLES } from "../../../enums/user"
import { sendFirebaseNotification } from "../../../shared/sendNotification"
import { QueryBuilder } from "../../../util/QueryBuilder"
import { IReferenceType, NOTIFICATION_TYPE } from "../notification/notification.interface"
import { sendReaujableNotification } from "../notification/notification.model"
import { saveNotification } from "../notification/sharedNotification"
import { syncUserRank } from "../user/syncUserRank"
import { User } from "../user/user.model"
import { syncCarFieldsFromCategory } from "./bulkOps"
import { ICar, IStatus, searchableFields } from "./car.interface"
import { Car } from "./car.model"

const createCar = async (payload: ICar) => {

    const user = await User.findById(payload.userId)
    if (!user) {
        throw new Error("User not found")
    }
    if (user.role !== USER_ROLES.USER) {
        throw new Error("You are not authorized to create a car")
    }
    const car = await Car.create(payload)
    //   send notification 🔔🔔🔔🔔🔔
    // sendReaujableNotification({
    //     fcmToken: user?.fcmToken,
    //     title: "Car Created",
    //     body: "You have created a car",
    //     type: NOTIFICATION_TYPE.CREATE_CAR,
    //     carId: car.id,
    //     senderId: user.id,
    //     receiverId: '',
    //     image: images[0],
    // })

    const valueForNotification = {
        title: "Car Created",
        body: "You have created a car",
        type: NOTIFICATION_TYPE.CREATE_CAR,
        notificationType: "NOTIFICATION",
        status: "SUCCESS",
        referenceType: IReferenceType.CAR,
        referenceId: car.id,
        senderId: payload.userId,
        receiverId: payload.userId,
    }
    saveNotification(valueForNotification)

    return car
}

const getAllCars = async (query: any) => {
    // await syncCarFieldsFromCategory();
    const queryBuilder = new QueryBuilder(Car.find().populate({ "path": "userId", "select": "name" }).select("-votersIds").sort({ ranking: -1 }), query)

    const allCars = await queryBuilder.
        search(searchableFields)
        .filter()
        .sort()
        .limit()
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
        .limit()
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
const carDetails = async (carId: string,) => {
    const car = await Car.findById(carId).populate({
        path: "userId",
        select: "name followersCount image"
    }).populate({
        path: "category",
        select: "battleCost Reward name "
    })
        .populate({
            path: "modelId",
            select: "description"
        })
        .select("-followers -votersIds").lean();
    if (!car) {
        throw new Error("Car not found")
    }

    await Car.findByIdAndUpdate(
        carId,
        {
            battleCost: (car.category as any)?.battleCost ?? 0,
            Reward: (car.category as any)?.Reward ?? 0,
            credit: (car.category as any)?.credit ?? 0,
            categoryName: (car.category as any)?.name ?? ""
        },
        { new: true }
    );

    const { userId, modelId, ...rest } = car

    return {
        ...rest,
        user: userId,
        description: (modelId as any)?.description || null,
    }
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
    const carOwner = await User.findById(CarInfo?.userId)

    if (!CarInfo) {
        throw new Error("Car not found")
    }

    let status;
    if (CarInfo.status === IStatus.PENDING) {
        status = IStatus.APPROVED
    } else if (CarInfo.status === IStatus.APPROVED) {
        status = IStatus.REJECTED
    } else if (CarInfo.status === IStatus.REJECTED) {
        status = IStatus.APPROVED
    }
    await syncCarFieldsFromCategory({ _id: carId });

    const car = await Car.findByIdAndUpdate({ _id: carId }, { status }, { new: true })
    // NOTIFICATION 🔔🔔🔔
    // sendReaujableNotification({
    //     fcmToken: carOwner?.fcmToken,
    //     title: "Car Status Changed",
    //     body: "Your car status has been changed to",
    //     type: NOTIFICATION_TYPE.CAR_APPROVED,
    //     carId: carId,
    //     senderId: userId,
    //     receiverId: carOwner?.id,
    //     image: CarInfo?.images?.[0]?.startsWith("http")
    //         ? CarInfo.images[0]
    //         : undefined,
    // })

    // const valueForNotification = {
    //     title: "Car Status Changed",
    //     body: "Your car status has been changed to",
    //     type: NOTIFICATION_TYPE.CAR_APPROVED,
    //     notificationType: "NOTIFICATION",
    //     referenceType: IReferenceType.CAR,
    //     status: "SUCCESS",
    //     senderId: userId,
    //     referenceId: carId,
    //     receiverId: carOwner?.id,
    // }
    // await saveNotification(valueForNotification)

    return car
}
export const CarService = { createCar, getAllCars, myCars, carDetails, changeStatus, SpecificCategoryCars }