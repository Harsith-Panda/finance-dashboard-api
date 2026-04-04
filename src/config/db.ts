import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("DB connection error:", error);
        process.exit(1);
    }
};

// These operations has been implemented after studying the documentation - https://mongoosejs.com/docs/api/connection.html#Connection.prototype.readyState

// Handle connection events gracefully
mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
    console.info("MongoDB reconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
});
