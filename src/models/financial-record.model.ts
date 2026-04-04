import mongoose, { Document, Schema, Model } from "mongoose";
import { RecordType } from "../types";

// Interface - Financial Record
export interface IFinancialRecord extends Document {
    amount: number;
    type: RecordType;
    category: string;
    date: Date;
    description: string | null;
    createdBy: mongoose.Types.ObjectId;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface IFinancialRecordModel extends Model<IFinancialRecord> {
    findActive(): mongoose.Query<IFinancialRecord[], IFinancialRecord>;
}

const FinancialRecordSchema = new Schema<IFinancialRecord>(
    {
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0.01, "Amount must be greater than 0"],
        },
        type: {
            type: String,
            enum: Object.values(RecordType),
            required: [true, "Record type is required"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
            maxlength: [50, "Category cannot exceed 50 characters"],
        },
        date: {
            type: Date,
            required: [true, "Date is required"],
            default: Date.now,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
            default: null,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Creator reference is required"],
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Indexes
FinancialRecordSchema.index({ isDeleted: 1, type: 1, date: -1 });
FinancialRecordSchema.index({ isDeleted: 1, category: 1 });
FinancialRecordSchema.index({ createdBy: 1 });
FinancialRecordSchema.index({ date: -1 });

FinancialRecordSchema.pre(/^find/, function() {
    const query = this as mongoose.Query<IFinancialRecord[], IFinancialRecord>;
    const conditions = query.getQuery();

    if (conditions.isDeleted === undefined) {
        query.where({ isDeleted: false });
    }
    return;
});

FinancialRecordSchema.statics.findActive = function() {
    return this.find({ isDeleted: false });
};

const FinancialRecord = mongoose.model<IFinancialRecord, IFinancialRecordModel>(
    "FinancialRecord",
    FinancialRecordSchema,
);
export default FinancialRecord;
