import User from "../models/user.model";
import { AppError } from "../utils/app-error";
import { signToken } from "../utils/jwt.util";
import { UserRole } from "../types";

// Protects from self-registering as admin / analyst
// Role can be escalated by existing admin
export const register = async (data: {
    name: string;
    email: string;
    password: string;
}) => {
    data.email = data.email.toLowerCase();
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        // User Already exist - 409 Conflict Error
        throw new AppError("Email already in use", 409);
    }

    // Create user — password hashed by pre-save hook in UserModel Automatically

    // Role is always viewer on self-registration
    // Admins are created via seed script or POST /api/users by an existing admin
    const user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: UserRole.VIEWER,
    });

    const token = signToken({
        userId: user._id.toString(),
        role: user.role,
    });

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

export const login = async (data: { email: string; password: string }) => {
    data.email = data.email.toLowerCase();
    const user = await User.findOne({ email: data.email }).select("+password"); // Password must be selected explicitly by default not selected

    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }

    if (user.status === "inactive") {
        throw new AppError(
            "Your account has been deactivated. Contact an admin",
            403,
        );
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = signToken({
        userId: user._id.toString(),
        role: user.role,
    });

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

export const getMe = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user;
};
