import { registerUserService, verifyEmailService } from "../services/auth.service.js";
import ApiError from "../utils/ApiError.js";
import { generateEmailToken } from "../utils/generateTokens.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import { registerSchema } from "../validators/auth.validator.js"

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