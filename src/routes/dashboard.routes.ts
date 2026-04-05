import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { UserRole } from "../types";
import * as dashboardController from "../controllers/dashboard.controller";

const router = Router();

// All dashboard routes must be authenticated
router.use(protect);

// Viewers can see the dashboard — that is their primary purpose
// Allowed : Viewers, Admin, Analyst
const allRoles = [UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER];
const analystAbove = [UserRole.ADMIN, UserRole.ANALYST];

// GET : /api/dashboard/summary
router.get("/summary", authorize(...allRoles), dashboardController.getSummary);

// GET : /api/dashboard/category-totals
router.get(
    "/category-totals",
    authorize(...allRoles),
    dashboardController.getCategoryTotals,
);

// GET : /api/dashboard/monthly-trends
router.get(
    "/monthly-trends",
    authorize(...allRoles),
    dashboardController.getMonthlyTrends,
);

// GET : /api/dashboard/recent-activity
router.get(
    "/recent-activity",
    authorize(...allRoles),
    dashboardController.getRecentActivity,
);

// GET : /api/dashboard/expense-breakdown (Viewers not allowed to view detailed analytics)
router.get(
    "/expense-breakdown",
    authorize(...analystAbove),
    dashboardController.getExpenseBreakdown,
);

export default router;
