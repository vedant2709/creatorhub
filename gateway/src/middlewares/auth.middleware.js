import jwt from "jsonwebtoken"

export const authMiddleware = (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log("Inside gateway middleware...",authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const token = authHeader.split(" ")[1];
        console.log("Token...",token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded....",decoded);

        // 🔥 Attach user to request
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}