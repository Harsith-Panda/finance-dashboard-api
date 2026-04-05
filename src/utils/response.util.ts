import { Response } from "express";

interface SuccessResponseOptions<T> {
    res: Response;
    statusCode?: number;
    message?: string;
    data?: T;
}

interface PaginatedResponseOptions<T> {
    res: Response;
    message?: string;
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}

// Standard success response
export const sendSuccess = <T>({
    res,
    statusCode = 200,
    message = "Success",
    data,
}: SuccessResponseOptions<T>): void => {
    res.status(statusCode).json({
        success: true,
        message,
        data: data ?? null,
    });
};

// Paginated list response
export const sendPaginated = <T>({
    res,
    message = "Success",
    data,
    total,
    page,
    totalPages,
}: PaginatedResponseOptions<T>): void => {
    res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            total,
            page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    });
};
