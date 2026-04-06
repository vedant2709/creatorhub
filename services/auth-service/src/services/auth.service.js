import bcrypt from "bcryptjs";
import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { Config } from "../config/config.js";
import userModel from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken, generateResetToken } from "../utils/generateTokens.js";
import { sendResetPasswordEmail } from "../utils/sendEmail.js";

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

export const loginUserService = async ({email, password}) => {
    // 1. Check user
    const user = await User.findOne({email});

    if (!user) {
        throw new ApiError(400, "User not found");
    }

    // 2. Check email verification
    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email first");
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new ApiError(400, "Invalid credentials");
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5. Store refresh token in DB
    user.refreshTokens.push({
        token: refreshToken
    });

    await user.save();

    return {
        accessToken,
        refreshToken,
        user
    };
}

export const getMeService = async (userId) => {
    const user = await User.findById(userId).select("-password -refreshTokens");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
}

export const refreshTokenService = async(oldRefreshToken) => {
    if (!oldRefreshToken) {
        throw new ApiError(401, "Refresh token missing");
    }

    let decoded;

    try {
        decoded = jwt.verify(oldRefreshToken, Config.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    // 1. Find user
    const user = await User.findById(decoded.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 2. Check if token exists in DB
    const tokenExists = user.refreshTokens.find(
        (t) => t.token === oldRefreshToken
    );

    if (!tokenExists) {
        throw new ApiError(401, "Refresh token not recognized");
    }

    // 🔥 3. ROTATION: remove old token
    user.refreshTokens = user.refreshTokens.filter(
        (t) => t.token !== oldRefreshToken
    );

    // 4. Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // 5. Store new refresh token
    user.refreshTokens.push({
        token: newRefreshToken
    });

    await user.save();

    return {
        newAccessToken,
        newRefreshToken
    };
}

export const logoutService = async(refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(400, "Refresh token missing");
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, Config.JWT_REFRESH_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decoded.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 🔥 Remove only this token (single device logout)
    user.refreshTokens = user.refreshTokens.filter(
        (t) => t.token !== refreshToken
    );

    await user.save();
}

export const forgotPasswordService = async(email) => {
    const user = await User.findOne({email});

    // 🔥 IMPORTANT: don't reveal if user exists
    if (!user) return;

    const token = generateResetToken(user);

    await sendResetPasswordEmail(email, token);
}

export const resetPasswordService = async(token, newPassword) => {
    let decoded;

    try {
        decoded = jwt.verify(token,Config.RESET_PASSWORD_SECRET);
    } catch (error) {
        throw new ApiError(400, "Invalid or expired token");
    }

    const user = await User.findById(decoded.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();
}