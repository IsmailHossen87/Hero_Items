import { JwtPayload } from "jsonwebtoken";
import { USER_ROLES } from "../../../enums/user";
import AppError from "../../../errors/AppError";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import { Item } from "../Item/item.model";
import { Car } from "../Car/car.model";
import { getUserGrowthByMonth } from "../../../util/userGroth";

const getDashboardData = async (user: JwtPayload, query: any) => {
    if (user.role !== USER_ROLES.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to get dashboard data")
    }
    const totalUser = await User.countDocuments()
    const totalItem = await Item.countDocuments()
    const totalCar = await Car.countDocuments()
    const totalVotes = (await Car.find()).reduce((acc, car) => acc + car.votes, 0)
    const pendingCar = await Car.countDocuments({ status: "PENDING" })
    const approvedCar = await Car.countDocuments({ status: "APPROVED" })
    const rejectedCar = await Car.countDocuments({ status: "REJECTED" })
    const userGrowth = await getUserGrowthByMonth()

    return { totalUser, totalItem, totalCar, totalVotes, pendingCar, approvedCar, rejectedCar, userGrowth }

}



export const DashboardService = {
    getDashboardData
}