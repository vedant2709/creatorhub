import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.route.js"
import cookieParser from "cookie-parser"

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use(errorHandler)

export default app;