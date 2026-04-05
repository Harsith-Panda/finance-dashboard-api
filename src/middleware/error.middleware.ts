import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";

// Handle Mongoose CastError — happens when an invalid MongoDB ID is passed (/api/records/invalid-id)
const handleCastError = (err: any): AppError => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

// Handle Mongoose duplicate key error — (email already exists)
const handleDuplicateKeyError = (err: any): AppError => {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    return new AppError(message, 409);
};

// Handle Mongoose validation errors — (required field missing)
const handleValidationError = (err: any): AppError => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input: ${errors.join(". ")}`;
    return new AppError(message, 422);
};

// Handle JWT errors
const handleJWTError = (): AppError =>
    new AppError("Invalid token. Please log in again", 401);

const handleJWTExpiredError = (): AppError =>
    new AppError("Your session has expired. Please log in again", 401);

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    err.statusCode = err.statusCode || 500;

    let error = { ...err, message: err.message };

    if (err.name === "CastError") error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === "ValidationError") error = handleValidationError(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    if (error.isOperational) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    console.error("UNEXPECTED ERROR:", err);
    res.status(500).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Something went wrong. Please try again later"
                : err.message,
    });
};
