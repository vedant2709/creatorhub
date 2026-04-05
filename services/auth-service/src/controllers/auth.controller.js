import { getMeService, loginUserService, refreshTokenService, registerUserService, verifyEmailService } from "../services/auth.service.js";
import ApiError from "../utils/ApiError.js";
import { generateEmailToken } from "../utils/generateTokens.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js"

export const registerUserController = async(req,res,next) => {
    try {
        const {error} = registerSchema.validate(req.body);
        if (error) {
            throw new ApiError(400, error.details[0].message);
        }

        const user = await registerUserService(req.body);

        const token = generateEmailToken(user);

        try {
            await sendVerificationEmail(user.email, token);
        } catch (err) {
            console.error("Email failed:", err);
        }

        res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email.",
            data: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error)
    }
}

export const verifyEmailController = async(req,res,next) => {
    try {
        const {token} = req.params;

        await verifyEmailService(token);

        res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });
    } catch (error) {
        next(error)
    }
}

export const loginUserController = async(req,res,next) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) throw new ApiError(400, error.details[0].message);

        const { accessToken, refreshToken, user } = await loginUserService(req.body);

        // 🍪 Set refresh token in cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // true in production (HTTPS)
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Login successfully",
            data: {
                accessToken,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            }
        })
    } catch (error) {
        next(error)
    }
}

export const getMeController = async(req,res,next) => {
    try {
        const user = await getMeService(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error)
    }
}

export const refreshTokenController = async(req,res,next) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;

        const {newAccessToken, newRefreshToken} = await refreshTokenService(oldRefreshToken);

        // 🍪 Set new refresh token cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false, // true in production
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        next(error)
    }
}