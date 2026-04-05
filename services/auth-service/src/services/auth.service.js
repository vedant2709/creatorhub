import bcrypt from "bcryptjs";
import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { Config } from "../config/config.js";
import userModel from "../models/user.model.js";

export const registerUserService = async ({name, email, password}) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    return user;
}

export const verifyEmailService = async (token) => {
    let decoded;

    try {
        decoded = jwt.verify(token, Config.EMAIL_VERIFY_SECRET);
    } catch (error) {
        throw new ApiError(400, "Invalid or expired token");
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if(user.isEmailVerified){
        throw new ApiError(400, "Email already verified");
    }

    user.isEmailVerified = true;
    await user.save();

    return user;
}