import { Request } from "express";

export enum UserRole {
    VIEWER = "viewer",
    ANALYST = "analyst",
    ADMIN = "admin",
}

export enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export enum RecordType {
    INCOME = "income",
    EXPENSE = "expense",
}

export interface AuthPayload {
    userId: string;
    role: UserRole;
}

// Extending Request object from express
export interface AuthRequest extends Request {
    user?: AuthPayload;
}

export interface PaginationResult<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}
