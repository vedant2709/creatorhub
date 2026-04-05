import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError.js";
import { Config } from "../config/config.js";

export const authMiddlware = (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Unauthorized");
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, Config.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        next(new ApiError(401, "Invalid or expired token"));
    }
}