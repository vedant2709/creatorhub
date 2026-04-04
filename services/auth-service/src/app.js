import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.route.js"

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(errorHandler)

export default app;