import { registerUserService } from "../services/auth.service.js";
import ApiError from "../utils/ApiError.js";
import { registerSchema } from "../validators/auth.validator.js"

export const registerUserController = async(req,res,next) => {
    try {
        const {error} = registerSchema.validate(req.body);
        if (error) {
            throw new ApiError(400, error.details[0].message);
        }

        const user = await registerUserService(req.body);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
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