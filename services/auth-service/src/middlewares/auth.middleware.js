import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError.js";
import { Config } from "../config/config.js";

export const authMiddlware = (req,res,next) => {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }

        const decoded = jwt.verify(token, Config.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        next(new ApiError(401, "Invalid or expired token"));
    }
}