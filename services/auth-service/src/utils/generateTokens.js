import jwt from "jsonwebtoken";
import { Config } from "../config/config.js";

// 🔐 Access Token (short-lived)
export const generateAccessToken = (user) =>{
    return jwt.sign(
        {id: user._id, role: user.role},
        Config.JWT_SECRET,
        {expiresIn: "15m"}
    )
}

// 🔁 Refresh Token (long-lived)
export const generateRefreshToken = (user) =>{
    return jwt.sign(
        {id: user._id},
        Config.JWT_REFRESH_SECRET,
        {expiresIn: "7d"}
    )
}

// 📧 Email Verification Token
export const generateEmailToken = (user) => {
  return jwt.sign(
    { id: user._id },
    Config.EMAIL_VERIFY_SECRET,
    { expiresIn: "1d" }
  );
};

export const generateResetToken = (user) => {
    return jwt.sign(
        { id: user._id },
        Config.RESET_PASSWORD_SECRET,
        { expiresIn: "15m" }
    )
}