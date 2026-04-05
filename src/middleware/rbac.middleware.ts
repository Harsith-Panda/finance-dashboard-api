import { Response, NextFunction } from "express";
import { UserRole, AuthRequest } from "../types";
import { AppError } from "../utils/app-error";

export const authorize =
    (...allowedRoles: UserRole[]) =>
        (req: AuthRequest, _res: Response, next: NextFunction): void => {
            if (!req.user) {
                return next(new AppError("Access denied. Please log in", 401));
            }

            if (!allowedRoles.includes(req.user.role)) {
                return next(
                    new AppError(
                        `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${req.user.role}`,
                        403,
                    ),
                );
            }

            next();
        };
