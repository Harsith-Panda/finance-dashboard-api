import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { sendSuccess, sendPaginated } from "../utils/response.util";
import * as userService from "../services/user.service";

// GET : /api/users
export const getAllUsers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { data, total, page, totalPages } = await userService.getAllUsers({
            role: req.query.role as any,
            status: req.query.status as any,
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10,
        });

        sendPaginated({
            res,
            message: "Users fetched successfully",
            data,
            total,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// GET : /api/users/:id
export const getUserById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const user = await userService.getUserById(req.params.id as string);

        sendSuccess({
            res,
            message: "User fetched successfully",
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

// PUT : /api/users/:id
export const updateUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const user = await userService.updateUser(
            req.params.id as string,
            req.body,
        );

        sendSuccess({
            res,
            message: "User updated successfully",
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

// PATCH : /api/users/:id/password
export const updatePassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const result = await userService.updatePassword(
            req.params.id as string,
            req.body.currentPassword,
            req.body.newPassword,
        );

        sendSuccess({
            res,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE : /api/users/:id
export const deleteUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const result = await userService.deleteUser(
            req.params.id as string,
            req.user!.userId,
        );

        sendSuccess({
            res,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

// POST : /api/users
// Create users with role as analyst or create other admins
export const createUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const user = await userService.createUser(req.body);

        sendSuccess({
            res,
            statusCode: 201,
            message: "User created successfully",
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};
