import { User } from "../app/modules/user/user.model";

export const getUserGrowthByMonth = async () => {
    const result = await User.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) // Last 12 months
                }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 }
        },
        {
            $project: {
                _id: 0,
                month: {
                    $let: {
                        vars: {
                            monthsInString: ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                        },
                        in: { $arrayElemAt: ["$$monthsInString", "$_id.month"] }
                    }
                },
                count: 1
            }
        }
    ]);

    // Ensure all 12 months are present (fill missing months with 0)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fullYearData = months.map(month => {
        const found = result.find(r => r.month === month);
        return {
            month,
            count: found ? found.count : 0
        };
    });

    return fullYearData;
}