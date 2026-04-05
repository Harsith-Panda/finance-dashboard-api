import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { validate } from "../middleware/validate.middleware";
import {
    createRecordRules,
    updateRecordRules,
    getRecordsRules,
    recordIdParamRules,
} from "../validators/record.validator";
import { UserRole } from "../types";
import * as recordController from "../controllers/record.controller";

const router = Router();

// All record routes require authentication
router.use(protect);

// GET : /api/records — open for all routes
router.get(
    "/",
    authorize(UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER),
    getRecordsRules,
    validate,
    recordController.getAllRecords,
);

// GET : /api/records/:id — open for all routes
router.get(
    "/:id",
    authorize(UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER),
    recordIdParamRules,
    validate,
    recordController.getRecordById,
);

// POST : /api/records — admin and analyst only
router.post(
    "/",
    authorize(UserRole.ADMIN, UserRole.ANALYST),
    createRecordRules,
    validate,
    recordController.createRecord,
);

// PUT : /api/records/:id — admin and analyst only
router.put(
    "/:id",
    authorize(UserRole.ADMIN, UserRole.ANALYST),
    updateRecordRules,
    validate,
    recordController.updateRecord,
);

// DELETE : /api/records/:id — admin only
router.delete(
    "/:id",
    authorize(UserRole.ADMIN),
    recordIdParamRules,
    validate,
    recordController.deleteRecord,
);

export default router;
