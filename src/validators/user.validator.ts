import { body, param } from "express-validator";

export const updateUserRules = [
    param("id").isMongoId().withMessage("Invalid user ID"),

    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),

    body("role")
        .optional()
        .isIn(["viewer", "analyst", "admin"])
        .withMessage("Role must be viewer, analyst or admin"),

    body("status")
        .optional()
        .isIn(["active", "inactive"])
        .withMessage("Status must be active or inactive"),
];

export const updatePasswordRules = [
    param("id").isMongoId().withMessage("Invalid user ID"),

    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters")
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error("New password must be different from current password");
            }
            return true;
        }),
];

export const userIdParamRules = [
    param("id").isMongoId().withMessage("Invalid user ID"),
];

export const createUserRules = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("role")
        .optional()
        .isIn(["viewer", "analyst", "admin"])
        .withMessage("Role must be viewer, analyst or admin"),
];
