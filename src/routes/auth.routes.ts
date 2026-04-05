import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { registerRules, loginRules } from "../validators/auth.validator";
import * as authController from "../controllers/auth.controller";

const router = Router();

// Public Routes
router.post("/register", registerRules, validate, authController.register);
router.post("/login", loginRules, validate, authController.login);

// Protected Route
router.get("/me", protect, authController.getMe);

export default router;
