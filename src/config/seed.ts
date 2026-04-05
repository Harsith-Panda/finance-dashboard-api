import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model";
import { UserRole } from "../types";

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("Connected to MongoDB");

        // Check if an admin already exists
        const existingAdmin = await User.findOne({ role: UserRole.ADMIN });
        if (existingAdmin) {
            console.log("Admin already exists. Skipping seed.");
            process.exit(0);
        }

        // Create the first admin
        await User.create({
            name: "Super Admin",
            email: process.env.ADMIN_EMAIL || "admin@finance.com",
            password: process.env.ADMIN_PASSWORD || "admin123456",
            role: UserRole.ADMIN,
            status: "active",
        });

        console.log("Admin user created successfully");
        console.log(`Email:    ${process.env.ADMIN_EMAIL || "admin@finance.com"}`);
        console.log(`Password: ${process.env.ADMIN_PASSWORD || "admin123456"}`);

        process.exit(0);
    } catch (error) {
        console.error("Seed failed:", error);
        process.exit(1);
    }
};

seed();
