import { Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../types";

export const validate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((err) => ({
                field: err.type === "field" ? err.path : "unknown",
                message: err.msg,
            })),
        });
        return;
    }

    next();
};
