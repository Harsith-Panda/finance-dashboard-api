import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "../types";

// Interface - User
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
    findActiveById(id: string): Promise<IUser | null>;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.VIEWER,
        },
        status: {
            type: String,
            enum: Object.values(UserStatus),
            default: UserStatus.ACTIVE,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

// Pre Save - Ensures password is hashed before saving anytime. Centralizes hashing logic
UserSchema.pre("save", async function(this: IUser) {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare password
UserSchema.methods.comparePassword = async function(
    candidatePassword: string,
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Find by id
UserSchema.statics.findActiveById = function(id: string) {
    return this.findOne({ _id: id, status: UserStatus.ACTIVE });
};

// Strip sensitive information from reponse (mainly password in this case)
UserSchema.set("toJSON", {
    transform: (_doc, ret: any) => {
        delete ret.password;
        return ret;
    },
});

const User = mongoose.model<IUser, IUserModel>("User", UserSchema);
export default User;
