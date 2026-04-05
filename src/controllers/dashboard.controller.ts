import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { sendSuccess } from "../utils/response.util";
import * as dashboardService from "../services/dashboard.service";

// GET : /api/dashboard/summary
export const getSummary = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const summary = await dashboardService.getSummary();

        sendSuccess({
            res,
            message: "Dashboard summary fetched successfully",
            data: summary,
        });
    } catch (error) {
        next(error);
    }
};

// GET : /api/dashboard/category-totals
export const getCategoryTotals = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const categories = await dashboardService.getCategoryTotals();

        sendSuccess({
            res,
            message: "Category totals fetched successfully",
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

// GET : /api/dashboard/monthly-trends
export const getMonthlyTrends = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const trends = await dashboardService.getMonthlyTrends();

        sendSuccess({
            res,
            message: "Monthly trends fetched successfully",
            data: trends,
        });
    } catch (error) {
        next(error);
    }
};

// GET : /api/dashboard/recent-activity
export const getRecentActivity = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const limit = Number(req.query.limit) || 10;
        const records = await dashboardService.getRecentActivity(limit);

        sendSuccess({
            res,
            message: "Recent activity fetched successfully",
            data: records,
        });
    } catch (error) {
        next(error);
    }
};

// GET : /api/dashboard/expense-breakdown
export const getExpenseBreakdown = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const breakdown = await dashboardService.getExpenseBreakdown();

        sendSuccess({
            res,
            message: "Expense breakdown fetched successfully",
            data: breakdown,
        });
    } catch (error) {
        next(error);
    }
};
