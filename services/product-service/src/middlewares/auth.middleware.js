import { Config } from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const authMiddlware = (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log(authHeader)

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Unauthorized");
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, Config.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        console.log("From product service auth middleware");
        next(new ApiError(401, "Invalid or expired token"));
    }
}