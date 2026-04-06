import {Config} from "../config/config.js";
import {Resend} from "resend";

const resend = new Resend(Config.RESEND_API_KEY);

export const sendVerificationEmail = async(email, token) => {
    const verifyUrl = `${Config.CLIENT_URL}/verify-email/${token}`;

    await resend.emails.send({
        from: Config.EMAIL_FROM,
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
    })
}

export const sendResetPasswordEmail = async(email, token) => {
    const resetUrl = `${Config.CLIENT_URL}/reset-password/${token}`;

    await resend.emails.send({
        from: Config.EMAIL_FROM,
        to: email,
        subject: "Reset your password",
        html: `
            <h2>Reset Password</h2>
            <p>Click below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link expires in 15 minutes.</p>
        `
    })
}