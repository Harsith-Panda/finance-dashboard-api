import FinancialRecord from "../models/financial-record.model";
import { AppError } from "../utils/app-error";
import { RecordType } from "../types";

export const createRecord = async (data: {
    amount: number;
    type: RecordType;
    category: string;
    date?: Date;
    description?: string;
    createdBy: string;
}) => {
    const record = await FinancialRecord.create({
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date ?? new Date(),
        description: data.description ?? null,
        createdBy: data.createdBy,
    });

    return record;
};

export const getAllRecords = async (filters: {
    type?: RecordType;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}) => {
    const query: Record<string, unknown> = {};

    // Type filter
    if (filters.type) {
        query.type = filters.type;
    }

    // Category filter
    if (filters.category) {
        query.category = {
            $regex: filters.category,
            $options: "i",
        };
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
        query.date = {
            ...(filters.startDate && { $gte: new Date(filters.startDate) }),
            ...(filters.endDate && { $lte: new Date(filters.endDate) }),
        };
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    // Note: isDeleted filter is handled automatically by pre-find query middleware in the model
    const [records, total] = await Promise.all([
        FinancialRecord.find(query)
            .populate("createdBy", "name email role")
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit),
        FinancialRecord.countDocuments(query),
    ]);

    return {
        data: records,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

export const getRecordById = async (id: string) => {
    const record = await FinancialRecord.findById(id).populate(
        "createdBy",
        "name email role",
    );

    if (!record) {
        throw new AppError("Record not found", 404);
    }

    return record;
};

export const updateRecord = async (
    id: string,
    data: {
        amount?: number;
        type?: RecordType;
        category?: string;
        date?: Date;
        description?: string;
    },
) => {
    const record = await FinancialRecord.findByIdAndUpdate(
        id,
        { $set: data },
        {
            new: true,
            runValidators: true,
        },
    ).populate("createdBy", "name email role");

    if (!record) {
        throw new AppError("Record not found", 404);
    }

    return record;
};

export const deleteRecord = async (id: string) => {
    // findById respects the pre-find middleware, if already soft deleted it returns null
    const record = await FinancialRecord.findById(id);

    if (!record) {
        throw new AppError("Record not found", 404);
    }

    // Mark as deleted and record the timestamp
    record.isDeleted = true;
    record.deletedAt = new Date();
    await record.save();

    return { message: "Record deleted successfully" };
};

export const getRecordsByCategory = async (category: string) => {
    const records = await FinancialRecord.find({ category });
    if (!records.length) {
        throw new AppError(`No records found for category: ${category}`, 404);
    }
    return records;
};
