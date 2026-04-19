import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser"
import dashboardRoute from "./routes/dashboard.route.js"

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/dashboard", dashboardRoute);

app.use(errorHandler)

export default app;
