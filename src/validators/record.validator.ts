import { body, param, query } from "express-validator";

export const createRecordRules = [
    body("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({ min: 0.01 })
        .withMessage("Amount must be a positive number greater than 0"),

    body("type")
        .notEmpty()
        .withMessage("Type is required")
        .isIn(["income", "expense"])
        .withMessage("Type must be income or expense"),

    body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required")
        .isLength({ max: 50 })
        .withMessage("Category cannot exceed 50 characters"),

    body("date")
        .optional()
        .isISO8601()
        .withMessage("Date must be a valid ISO 8601 date")
        .toDate(),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),
];

export const updateRecordRules = [
    param("id").isMongoId().withMessage("Invalid record ID"),

    body("amount")
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage("Amount must be a positive number greater than 0"),

    body("type")
        .optional()
        .isIn(["income", "expense"])
        .withMessage("Type must be income or expense"),

    body("category")
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage("Category cannot exceed 50 characters"),

    body("date")
        .optional()
        .isISO8601()
        .withMessage("Date must be a valid ISO 8601 date")
        .toDate(),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),
];

export const getRecordsRules = [
    query("type")
        .optional()
        .isIn(["income", "expense"])
        .withMessage("Type must be income or expense"),

    query("category")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Category cannot be empty"),

    query("startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid ISO 8601 date"),

    query("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid ISO 8601 date")
        .custom((value, { req }) => {
            if (
                req.query?.startDate &&
                new Date(value) < new Date(req.query.startDate as string)
            ) {
                throw new Error("End date must be after start date");
            }
            return true;
        }),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer")
        .toInt(),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100")
        .toInt(),
];

export const recordIdParamRules = [
    param("id").isMongoId().withMessage("Invalid record ID"),
];
