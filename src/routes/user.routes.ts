import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { validate } from "../middleware/validate.middleware";
import {
    updateUserRules,
    updatePasswordRules,
    userIdParamRules,
    createUserRules,
} from "../validators/user.validator";
import { UserRole } from "../types";
import * as userController from "../controllers/user.controller";

const router = Router();

// Apllying protect middleware on all routes
router.use(protect);

// GET : /api/users — admin only
router.get("/", authorize(UserRole.ADMIN), userController.getAllUsers);

// GET : /api/users/:id — admin only
router.get(
    "/:id",
    authorize(UserRole.ADMIN),
    userIdParamRules,
    validate,
    userController.getUserById,
);

// PUT : /api/users/:id — admin only
router.put(
    "/:id",
    authorize(UserRole.ADMIN),
    updateUserRules,
    validate,
    userController.updateUser,
);

// PATCH : /api/users/:id/password — admin only
router.patch(
    "/:id/password",
    authorize(UserRole.ADMIN),
    updatePasswordRules,
    validate,
    userController.updatePassword,
);

// DELETE : /api/users/:id — admin only
router.delete(
    "/:id",
    authorize(UserRole.ADMIN),
    userIdParamRules,
    validate,
    userController.deleteUser,
);

// POST : /api/users — admin only
router.post(
    "/",
    authorize(UserRole.ADMIN),
    createUserRules,
    validate,
    userController.createUser,
);

export default router;
