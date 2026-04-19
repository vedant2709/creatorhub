import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError.js";
import { Config } from "../config/config.js";

export const authMiddleware = (req,res,next) => {
    try {
        const cookieToken = req.cookies?.accessToken;
        const bearerToken = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null;
        const token = cookieToken || bearerToken;

        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }

        const decoded = jwt.verify(token, Config.JWT_SECRET);

        req.user = decoded;
        req.token = token;

        next();
    } catch (error) {
        next(new ApiError(401, "Invalid or expired token from product service"));
    }
}
