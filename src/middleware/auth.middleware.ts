import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util";
import { AppError } from "../utils/app-error";
import { AuthRequest } from "../types";
import User from "../models/user.model";

export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        // Checkinf Token in Headers
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return next(new AppError("Access denied. No token provided", 401));
        }

        // Extracting Token from Header
        const token = authHeader.split(" ")[1];
        if (!token) {
            return next(new AppError("Access denied. No token provided", 401));
        }

        // Verifying Token
        const decoded = verifyToken(token);

        // Check if User in DB and active
        const user = await User.findById(decoded.userId);
        if (!user) {
            return next(
                new AppError("User belonging to this token no longer exists", 401),
            );
        }

        if (user.status === "inactive") {
            return next(
                new AppError(
                    "Your account has been deactivated. Contact an admin",
                    403,
                ),
            );
        }

        req.user = { userId: decoded.userId, role: decoded.role };

        next();
    } catch (error) {
        next(error);
    }
};
