import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { Config } from "./config/config.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: Config.CLIENT_URL, // frontend URL
  credentials: true
}));

app.use("/api/auth", authRoutes);

app.use(errorHandler)

export default app;