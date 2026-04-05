import express from "express";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/error.middleware";
import routes from "./routes";

const app = express();

app.use(express.json());

// Helth-Check Route
app.get("/health-check", (req, res) => {
    res.json({
        status: "ok",
        db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
});

// Routes
// All API Routes
app.use("/api", routes);

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global Error Handler
app.use(errorHandler);

export default app;
