import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { sendSuccess } from "../utils/response.util";
import * as authService from "../services/auth.service";

// POST : /api/auth/register
export const register = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { user, token } = await authService.register(req.body);

        sendSuccess({
            res,
            statusCode: 201,
            message: "Account created successfully",
            data: { user, token },
        });
    } catch (error) {
        next(error);
    }
};

// POST : /api/auth/login
export const login = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { user, token } = await authService.login(req.body);

        sendSuccess({
            res,
            statusCode: 200,
            message: "Logged in successfully",
            data: { user, token },
        });
    } catch (error) {
        next(error);
    }
};

// GET : /api/auth/me
export const getMe = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const user = await authService.getMe(req.user!.userId);

        sendSuccess({
            res,
            statusCode: 200,
            message: "User fetched successfully",
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};
