import User from "../models/user.model";
import { AppError } from "../utils/app-error";
import { UserRole, UserStatus } from "../types";

export const getAllUsers = async (filters: {
    role?: UserRole;
    status?: UserStatus;
    page?: number;
    limit?: number;
}) => {
    const query: Record<string, unknown> = {};

    if (filters.role) query.role = filters.role;
    if (filters.status) query.status = filters.status;

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query),
    ]);

    return {
        data: users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

export const getUserById = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user;
};

export const updateUser = async (
    id: string,
    data: {
        name?: string;
        email?: string;
        role?: UserRole;
        status?: UserStatus;
    },
) => {
    if (data.email) {
        const existingUser = await User.findOne({
            email: data.email.toLowerCase(),
            _id: { $ne: id },
        });
        if (existingUser) {
            throw new AppError("Email already in use", 409);
        }
    }

    const user = await User.findByIdAndUpdate(
        id,
        { $set: data },
        {
            new: true,
            runValidators: true,
        },
    );

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
};

export const updatePassword = async (
    id: string,
    currentPassword: string,
    newPassword: string,
) => {
    const user = await User.findById(id).select("+password");
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw new AppError("Current password is incorrect", 401);
    }

    user.password = newPassword;
    await user.save();

    return { message: "Password updated successfully" };
};

export const deleteUser = async (id: string, requestingUserId: string) => {
    if (id === requestingUserId) {
        throw new AppError("You cannot delete your own account", 400);
    }

    const user = await User.findById(id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    // Soft delete — deactivate instead of removing from DB
    user.status = UserStatus.INACTIVE;
    await user.save();

    return { message: "User deactivated successfully" };
};

// Admin Only - For creating users of roles as analyst and other admins
export const createUser = async (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}) => {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        throw new AppError("Email already in use", 409);
    }

    // Admin can assign any role when creating a user
    const user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role ?? UserRole.VIEWER,
    });

    return user;
};
