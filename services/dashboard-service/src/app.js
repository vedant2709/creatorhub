import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser"
import dashboardRoute from "./routes/dashboard.route.js"
import morgan from "morgan";
import logger from "./utils/logger.js";

const app = express();

app.use(
    morgan("combined", {
        skip: (req, res) => res.statusCode < 400,
        stream: { write: (message) => logger.info(message.trim()) },
    })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/dashboard", dashboardRoute);

app.use(errorHandler)

export default app;
