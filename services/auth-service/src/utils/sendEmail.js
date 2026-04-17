import nodemailer from "nodemailer";
import { Config } from "../config/config.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: Config.EMAIL_USER,
        pass: Config.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${Config.CLIENT_URL}/verify-email/${token}`;

    await transporter.sendMail({
        from: Config.EMAIL_USER,
        to: email,
        subject: "Verify your email",
        html: `
            <h2>Welcome to CreatorHub 🚀</h2>
            <p>Please verify your email by clicking below:</p>
            <a href="${verifyUrl}" 
                style="padding:10px 20px;background:black;color:white;text-decoration:none;">
                Verify Email
            </a>
            <p>If you didn’t sign up, ignore this email.</p>
        `
    });
};

export const sendResetPasswordEmail = async (email, token) => {
    const resetUrl = `${Config.CLIENT_URL}/reset-password/${token}`;

    await transporter.sendMail({
        from: Config.EMAIL_USER,
        to: email,
        subject: "Reset your password",
        html: `
            <h2>Reset Password</h2>
            <p>Click below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link expires in 15 minutes.</p>
        `
    });
};
