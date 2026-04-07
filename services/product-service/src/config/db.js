import mongoose from "mongoose";
import { Config } from "./config.js";

const connectToDB = async () => {
    try {
        await mongoose.connect(Config.MONGO_URI);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("DB connection error:", err);
        process.exit(1); // Exit process if DB connection fails
    }
}

export default connectToDB;