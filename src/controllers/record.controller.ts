import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { sendSuccess, sendPaginated } from "../utils/response.util";
import * as recordService from "../services/record.service";

// POST : /api/records
export const createRecord = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const record = await recordService.createRecord({
            ...req.body,
            createdBy: req.user!.userId,
        });

        sendSuccess({
            res,
            statusCode: 201,
            message: "Record created successfully",
            data: { record },
        });
    } catch (error) {
        next(error);
    }
};

// GET : /api/records
export const getAllRecords = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { data, total, page, totalPages } = await recordService.getAllRecords(
            {
                type: req.query.type as any,
                category: req.query.category as string,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
            },
        );

        sendPaginated({
            res,
            message: "Records fetched successfully",
            data,
            total,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// GET : /api/records/:id
export const getRecordById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const record = await recordService.getRecordById(req.params.id as string);

        sendSuccess({
            res,
            message: "Record fetched successfully",
            data: { record },
        });
    } catch (error) {
        next(error);
    }
};

// PUT : /api/records/:id
export const updateRecord = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const record = await recordService.updateRecord(
            req.params.id as string,
            req.body,
        );

        sendSuccess({
            res,
            message: "Record updated successfully",
            data: { record },
        });
    } catch (error) {
        next(error);
    }
};

// DELETE : /api/records/:id
export const deleteRecord = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const result = await recordService.deleteRecord(req.params.id as string);

        sendSuccess({
            res,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};
