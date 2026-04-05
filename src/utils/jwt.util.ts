import jwt, { SignOptions } from "jsonwebtoken";
import { AuthPayload } from "../types";
import { AppError } from "./app-error";

const getSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET is not defined in environment variables");
    return secret;
};

export const signToken = (payload: AuthPayload) => {
    return jwt.sign(payload, getSecret(), {
        expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
    });
};

export const verifyToken = (token: string): AuthPayload => {
    try {
        return jwt.verify(token, getSecret()) as AuthPayload;
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new AppError("Your session has expired. Please log in again", 401);
        }
        throw new AppError("Invalid token. Please log in again", 401);
    }
};
