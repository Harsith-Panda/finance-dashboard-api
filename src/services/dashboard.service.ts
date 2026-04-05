import FinancialRecord from "../models/financial-record.model";

// This service will have 5 tasks
// Summary, Category Total, Monthly Trends, Recent Activity, Expense Breakdown

export const getSummary = async () => {
    const result = await FinancialRecord.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: "$type",
                total: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
    ]);

    const incomeData = result.find((r) => r._id === "income");
    const expenseData = result.find((r) => r._id === "expense");

    const totalIncome = incomeData?.total ?? 0;
    const totalExpenses = expenseData?.total ?? 0;
    const incomeCount = incomeData?.count ?? 0;
    const expenseCount = expenseData?.count ?? 0;

    return {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        totalRecords: incomeCount + expenseCount,
        incomeCount,
        expenseCount,
    };
};

export const getCategoryTotals = async () => {
    const result = await FinancialRecord.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: { category: "$category", type: "$type" },
                total: { $sum: "$amount" },
                count: { $sum: 1 },
                avgAmount: { $avg: "$amount" },
            },
        },
        {
            $project: {
                _id: 0,
                category: "$_id.category",
                type: "$_id.type",
                total: { $round: ["$total", 2] },
                count: 1,
                avgAmount: { $round: ["$avgAmount", 2] },
            },
        },
        { $sort: { total: -1 } },
    ]);

    return result;
};

export const getMonthlyTrends = async () => {
    const result = await FinancialRecord.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    type: "$type",
                },
                total: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                type: "$_id.type",
                total: { $round: ["$total", 2] },
                count: 1,
            },
        },
        { $sort: { year: -1, month: -1 } },
        { $limit: 24 },
    ]);

    const grouped: Record<
        string,
        {
            year: number;
            month: number;
            income: number;
            expense: number;
            netBalance: number;
        }
    > = {};

    result.forEach((entry) => {
        const key = `${entry.year}-${entry.month}`;

        if (!grouped[key]) {
            grouped[key] = {
                year: entry.year,
                month: entry.month,
                income: 0,
                expense: 0,
                netBalance: 0,
            };
        }

        if (entry.type === "income") {
            grouped[key].income = entry.total;
        } else {
            grouped[key].expense = entry.total;
        }

        grouped[key].netBalance = grouped[key].income - grouped[key].expense;
    });

    // Sorted by year and month descending
    return Object.values(grouped).sort((a, b) =>
        b.year !== a.year ? b.year - a.year : b.month - a.month,
    );
};

export const getRecentActivity = async (limit: number = 10) => {
    const records = await FinancialRecord.find({ isDeleted: false })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .limit(limit);

    return records;
};

export const getExpenseBreakdown = async () => {
    const result = await FinancialRecord.aggregate([
        { $match: { isDeleted: false, type: "expense" } },
        {
            $group: {
                _id: "$category",
                total: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: null,
                categories: {
                    $push: {
                        category: "$_id",
                        total: "$total",
                        count: "$count",
                    },
                },
                grandTotal: { $sum: "$total" },
            },
        },
        {
            $project: {
                _id: 0,
                categories: {
                    $map: {
                        input: "$categories",
                        as: "cat",
                        in: {
                            category: "$$cat.category",
                            total: { $round: ["$$cat.total", 2] },
                            count: "$$cat.count",
                            percentage: {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: ["$$cat.total", "$grandTotal"] },
                                            100,
                                        ],
                                    },
                                    2,
                                ],
                            },
                        },
                    },
                },
                grandTotal: { $round: ["$grandTotal", 2] },
            },
        },
    ]);

    if (!result.length) {
        return { categories: [], grandTotal: 0 };
    }

    result[0].categories.sort(
        (a: { total: number }, b: { total: number }) => b.total - a.total,
    );

    return result[0];
};
