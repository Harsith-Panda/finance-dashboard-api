import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import recordRoutes from "./record.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/records", recordRoutes);

export default router;
