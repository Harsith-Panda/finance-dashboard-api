import express from "express";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/error.middleware";

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

// Global Error Handler
app.use(errorHandler);

export default app;
